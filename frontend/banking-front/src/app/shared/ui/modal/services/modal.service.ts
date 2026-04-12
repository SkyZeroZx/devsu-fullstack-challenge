import {
  ApplicationRef,
  ComponentRef,
  EnvironmentInjector,
  Injectable,
  Type,
  createComponent,
  DOCUMENT,
  inject,
} from '@angular/core';
import { CreateModal } from '../interface/modal.interface';

import { ModalComponent } from '../components/modal.component';

import { onRouterNavigateClean } from '../../utils/router-navigate-clean';

@Injectable({ providedIn: 'root' })
export class ModalService {
  private readonly document = inject(DOCUMENT);
  private readonly appRef = inject(ApplicationRef);
  private readonly injector = inject(EnvironmentInjector);

  // Create a reference to our modal component
  protected newModalComponent!: ComponentRef<ModalComponent>;
  // Optional content passed at the creation : animation, size, ...
  protected options: CreateModal = {};

  private _listModalComponentRef: ComponentRef<ModalComponent>[] = [];

  constructor() {
    onRouterNavigateClean(() => this.cleanupModals());
  }

  get listModalComponentRef() {
    return this._listModalComponentRef;
  }

  cleanupModals() {
    for (const modal of this._listModalComponentRef) {
      modal.instance.remove();
      modal.destroy();
    }
    this._listModalComponentRef = [];
  }

  open<C>(component: Type<C>, createModalOptions: CreateModal = {}) {
    this.options = createModalOptions as CreateModal;
    return this.openWithComponent(
      createModalOptions,
      component,
    ) as ComponentRef<C>;
  }

  private getProjectNodes(
    options: CreateModal,
    newComponent: ComponentRef<unknown>,
  ) {
    const isBottomSheet = options?.mode === 'bottom-sheet';
    if (isBottomSheet) {
      return [[], [newComponent.location.nativeElement]];
    } else {
      return [[newComponent.location.nativeElement], []];
    }
  }

  private openWithComponent(options: CreateModal, component: Type<unknown>) {
    let newComponent = createComponent(component, {
      environmentInjector: this.injector,
    });

    // create the modal component and project the instance of the desired component in the ng-content
    this.newModalComponent = createComponent(ModalComponent, {
      environmentInjector: this.injector,
      projectableNodes: this.getProjectNodes(options, newComponent),
    });

    this._listModalComponentRef.push(this.newModalComponent);

    this.newModalComponent.instance.mode.set(options?.mode || 'modal');
    this.newModalComponent.instance.style.set(options?.style || {});

    const instance = newComponent.instance as Record<string, unknown>;
    instance['modalInstance'] = this.newModalComponent.instance;
    instance['data'] = options?.data ?? null;

    this.newModalComponent.instance.closed.subscribe(() => {
      // Avoid memory leaks by destroying the component when the modal is closed
      newComponent?.destroy?.();
      (newComponent as unknown) = null;
      this._listModalComponentRef = [];
    });

    this.document.body.appendChild(
      this.newModalComponent.location.nativeElement,
    );

    this.appRef.attachView(newComponent.hostView);
    this.appRef.attachView(this.newModalComponent.hostView);
    return newComponent;
  }
}
