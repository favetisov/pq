import {
  Component,
  Input,
  OnInit,
  HostBinding,
  HostListener,
  Output,
  EventEmitter,
  AfterViewInit,
  ContentChildren,
  ElementRef,
  ContentChild,
} from '@angular/core';
import { AsyncSubject, BehaviorSubject, combineLatest, Subject } from 'rxjs';
import { map, pairwise, distinctUntilChanged, takeUntil, tap } from 'rxjs/operators';

@Component({
  selector: 'adm-list',
  template: ` <ng-content></ng-content> `,
  styleUrls: ['./adm-list.component.scss'],
})
export class AdmListComponent<Item> implements OnInit {
  @Input() items$: BehaviorSubject<Item[]>;
  constructor() {}

  ngOnInit() {}
}

@Component({
  selector: 'adm-list-head-cell',
  template: ` <ng-content></ng-content><adm-rotating-chevron [down]="position == 'down'"></adm-rotating-chevron> `,
  styleUrls: ['./adm-list-head-cell.component.scss'],
})
export class AdmListHeadCellComponent implements OnInit {
  position: 'disabled' | 'clear' | 'down' | 'up';

  @HostBinding('class.down')
  get down() {
    return this.position === 'down';
  }
  @HostBinding('class.up')
  get up() {
    return this.position === 'up';
  }

  @Input() class;
  @Input() sortKey: string;
  @Output() clicked = new EventEmitter<string>();

  @HostListener('click')
  onClick() {
    if (!this.sortKey) return;
    if (this.position === 'up') {
      this.position = 'down';
      this.clicked.next('desc');
    } else {
      this.position = 'up';
      this.clicked.next('asc');
    }
  }

  constructor() {}

  ngOnInit() {
    this.position = Boolean(this.sortKey) ? 'clear' : 'disabled';
  }
}

@Component({
  selector: 'adm-list-head',
  template: '<ng-content></ng-content>',
  styleUrls: ['./adm-list-head.component.scss'],
})
export class AdmListHeadComponent implements AfterViewInit {
  @Input() sort$: BehaviorSubject<{ key: string; order: 'asc' | 'desc' }>;

  @ContentChildren(AdmListHeadCellComponent) cells;

  constructor() {}

  ngAfterViewInit() {
    this.cells.forEach((c, idx) => {
      c.clicked.subscribe((order) => {
        if (this.sort$) this.sort$.next({ key: c.sortKey, order });
        this.cells.filter((cl) => cl !== c).forEach((cl) => (cl.position = 'clear'));
      });
      if (this.sort$) {
        const initSort = this.sort$.getValue();
        if (initSort) {
          if (c.sortKey === initSort.key) {
            c.position = initSort.order === 'desc' ? 'down' : 'up';
          }
        }
      }
    });
  }
}

@Component({
  selector: 'adm-list-item-head',
  template: '<ng-content></ng-content>',
  styleUrls: ['./adm-list-item-head.component.scss'],
})
export class AdmListItemHeadComponent {
  constructor(public el: ElementRef) {}
}

@Component({
  selector: 'adm-list-item-content',
  template: '<ng-content></ng-content>',
  styleUrls: ['./adm-list-item-content.component.scss'],
})
export class AdmListItemContentComponent {
  constructor(public el: ElementRef) {}

  @HostListener('click', ['$event'])
  onclick(e) {
    e.stopPropagation();
  }
}

@Component({
  selector: 'adm-list-item',
  template: '<ng-content></ng-content>',
  styleUrls: ['./adm-list-item.component.scss'],
})
export class AdmListItemComponent implements AfterViewInit {
  @ContentChild(AdmListItemContentComponent) content: AdmListItemContentComponent;
  @ContentChild(AdmListItemHeadComponent) head: AdmListItemHeadComponent;

  @Output() onOpen = new EventEmitter<boolean>();
  @Output() onClose = new EventEmitter<boolean>();

  @HostBinding('class.open')
  get isOpen() {
    return this.showContent$.getValue();
  }

  onDestroyed$ = new AsyncSubject<boolean>();

  headHeight$ = new Subject<number>();
  contentHeight$ = new Subject<number>();
  showContent$ = new BehaviorSubject(false);

  heightChanges$ = combineLatest(
    this.headHeight$.pipe(distinctUntilChanged()),
    this.contentHeight$.pipe(distinctUntilChanged()),
    this.showContent$.pipe(distinctUntilChanged()),
  ).pipe(
    takeUntil(this.onDestroyed$),
    map(([headHeight, contentHeight, show]) => (show ? headHeight + contentHeight : headHeight)),
    distinctUntilChanged(),
    pairwise(),
    map(([prev, current]) => {
      const duration = Math.abs(current - prev) / 1000;
      return { from: prev, to: current, duration: duration };
    }),
  );

  placeholder; // для плавного удаления
  constructor(public el: ElementRef) {}

  ngAfterViewInit() {
    this.heightChanges$.subscribe(({ from, to, duration }) => {
      this.el.nativeElement.style.transition = `height ${duration}s ease-in-out`;
      this.el.nativeElement.style.height = to + 'px';
      this.placeholder.height = to;
      this.placeholder.style.transition = `height ${duration}s ease-in-out`;
    });

    if (this.head) {
      const { marginTop, marginBottom } = window.getComputedStyle(this.head.el.nativeElement);
      this.el.nativeElement.style.height =
        this.head.el.nativeElement.offsetHeight + parseInt(marginTop) + parseInt(marginBottom) + 'px';
    }

    if (this.content) {
      this.content.el.nativeElement.style.transform = 'scale(.0000001)';
    }
    this.placeholder = document.createElement('div');
    this.el.nativeElement.parentNode.insertBefore(this.placeholder, this.el.nativeElement);

    this.defineHeights();
    this.open();
    this.close();
  }

  private defineHeights() {
    if (this.el && this.el.nativeElement) {
      if (this.head) {
        const headStyle = window.getComputedStyle(this.head.el.nativeElement);
        this.headHeight$.next(
          this.head.el.nativeElement.offsetHeight + parseInt(headStyle.marginTop) + parseInt(headStyle.marginBottom),
        );
      } else {
        this.headHeight$.next(0);
      }

      if (this.content) {
        const contentStyle = window.getComputedStyle(this.content.el.nativeElement);
        this.contentHeight$.next(
          this.content.el.nativeElement.offsetHeight +
            parseInt(contentStyle.marginTop) +
            parseInt(contentStyle.marginBottom),
        );
      } else {
        this.contentHeight$.next(0);
      }
    }
  }

  @HostListener('click')
  private onclick() {
    this.showContent$.getValue() ? this.close() : this.open();
  }

  @HostListener('transitionend', ['$event'])
  onTransitionEnd(event) {
    if (event.propertyName === 'height') {
      if (!this.showContent$.getValue() && this.content) {
        this.content.el.nativeElement.style.transform = 'scaleY(.0000001)';
      }
    }
  }

  open() {
    this.showContent$.next(true);
    this.onOpen.emit(true);
    this.el.nativeElement.style.overflow = 'hidden';
    if (this.content) {
      this.content.el.nativeElement.style.transform = 'scaleY(1)';
    }
  }

  close() {
    this.showContent$.next(false);
    this.onClose.emit(true);
  }

  ngOnDestroy() {
    if (this.placeholder) this.placeholder.style.height = this.placeholder.height + 'px';
    setTimeout(() => (this.placeholder.style.height = 0), 1);
    this.onDestroyed$.next(true);
    this.onDestroyed$.complete();
  }
}
