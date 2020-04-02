import { Component, ContentChild, ElementRef, OnDestroy, OnInit } from '@angular/core';
import { AsyncSubject, fromEvent, Subject } from 'rxjs';
import { takeUntil, throttleTime } from 'rxjs/operators';

@Component({
  selector: 'adm-card',
  templateUrl: './adm-card.component.html',
  styleUrls: ['./adm-card.component.scss'],
})
export class AdmCardComponent implements OnInit, OnDestroy {
  @ContentChild('content', { read: ElementRef }) content;
  @ContentChild('footer', { read: ElementRef }) footer;
  onDestroyed$ = new AsyncSubject();
  adjustSignal$ = new Subject();

  constructor() {}

  async ngOnInit() {
    fromEvent(window, 'resize')
      .pipe(takeUntil(this.onDestroyed$))
      .subscribe((e) => this.adjustSignal$.next(true));

    this.adjustSignal$.pipe(takeUntil(this.onDestroyed$), throttleTime(500)).subscribe(() => {
      this.adjustHeight();
    });
  }

  // async ngAfterContentChecked() {
  //   this.adjustSignal$.next(true);
  // }

  private adjustHeight() {
    const contentElement = this.content;
    if (contentElement) {
      const footerHeight = this.footer
        ? this.footer.nativeElement.clientHeight +
          parseFloat(getComputedStyle(this.footer.nativeElement).paddingTop) +
          parseFloat(getComputedStyle(this.footer.nativeElement).paddingBottom) +
          0
        : 0;
      const BOTTOM_MARGIN = 20;
      contentElement.nativeElement.style['max-height'] = `${
        window.innerHeight - contentElement.nativeElement.getBoundingClientRect().top - footerHeight - BOTTOM_MARGIN
      }px`;
      contentElement.nativeElement.style['overflow-y'] = 'auto';
    }
  }

  async ngOnDestroy() {
    this.onDestroyed$.next(true);
    this.onDestroyed$.complete();
  }
}
