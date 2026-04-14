import { TestBed } from '@angular/core/testing';
import { GtagAnalyticsAdapter } from './gtag.analytics';

describe('GtagAnalyticsAdapter', () => {
  let service: GtagAnalyticsAdapter;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [GtagAnalyticsAdapter] });
    service = TestBed.inject(GtagAnalyticsAdapter);
  });

  afterEach(() => {
    // cleanup global gtag if set
    try {
      delete (window as any).gtag;
    } catch {
      (window as any).gtag = undefined;
    }
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('calls window.gtag for trackEvent when gtag exists', () => {
    const g = jest.fn();
    (window as any).gtag = g;

    service.trackEvent('test_event', { foo: 'bar' });

    expect(g).toHaveBeenCalledWith('event', 'test_event', { foo: 'bar' });
  });

  it('does not throw when gtag is not present', () => {
    // ensure absent
    (window as any).gtag = undefined;
    expect(() => service.trackEvent('no_gtag')).not.toThrow();
  });

  it('sends page_view event with title and location', () => {
    const g = jest.fn();
    (window as any).gtag = g;

    // set document title
    document.title = 'My Page Title';

    // compute expected page_location from current jsdom location
    const expectedLocation = `${location.protocol}//${location.host}${location.pathname}`;

    service.trackPageView();

    expect(g).toHaveBeenCalledWith('event', 'page_view', {
      page_title: 'My Page Title',
      page_location: expectedLocation,
    });
  });
});
