import {
  ApplicationRef,
  createComponent,
  inject,
  Injector,
  Type,
  DOCUMENT,
} from '@angular/core';

export function injectDomPortal() {
  const injector = inject(Injector);
  const appRef = inject(ApplicationRef);
  const document = inject(DOCUMENT);

  function attachRoot<T>(componentType: Type<T>) {
    const componentRef = createComponent(componentType, {
      elementInjector: injector,
      environmentInjector: appRef.injector,
    });

    appRef.attachView(componentRef.hostView);

    const element = componentRef.location.nativeElement;
    document.body.appendChild(element);

    const destroy = () => {
      element.remove();
      componentRef.destroy();
    };

    return {
      instance: componentRef.instance,
      destroy,
    };
  }

  return {
    attachRoot,
  };
}
