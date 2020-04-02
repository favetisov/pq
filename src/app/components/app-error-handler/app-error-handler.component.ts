import { Component, ElementRef, HostListener, NgZone, OnInit } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { tap, filter } from 'rxjs/operators';
import { ErrorService } from 'app/services/error.service';
import { NavigationStart, Router } from '@angular/router';

@Component({
  selector: 'app-error-handler',
  templateUrl: './app-error-handler.component.html',
  styleUrls: ['./app-error-handler.component.scss'],
})
export class AppErrorHandlerComponent implements OnInit {
  open$ = new BehaviorSubject(false);

  error$ = this.errorService.error$.pipe(
    filter(Boolean),
    tap(() => this.open$.next(true)),
    tap(() => this.el.nativeElement.scrollIntoView()),
    tap(() => setTimeout(() => this.open$.next(false), 3000)),
  );

  @HostListener('click')
  onClick() {
    this.open$.next(false);
  }

  constructor(
    private el: ElementRef,
    private errorService: ErrorService,
    private ngZone: NgZone,
    private router: Router,
  ) {}

  async ngOnInit() {
    this.router.events.pipe(filter((v) => v instanceof NavigationStart)).subscribe((val) => {
      this.ngZone.run(() => {
        this.open$.next(false);
      });
    });

    this.open$.subscribe((open) => {
      const height = this.el.nativeElement.offsetHeight;
      if (!open) {
        this.el.nativeElement.style.transform = `translateY(-${height}px)`;
      } else {
        this.el.nativeElement.style.transform = 'translateY(0)';
      }
    });
  }
}
