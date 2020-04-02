import {
  Component,
  Directive,
  OnInit,
  HostBinding,
  HostListener,
  Input,
  ContentChild,
  OnChanges,
  OnDestroy,
  ElementRef,
  SimpleChanges,
} from '@angular/core';
import { BehaviorSubject as BSubject } from 'rxjs';
import { Subscription, combineLatest } from 'rxjs';
import { isNil } from 'lodash';
import { AdmPhotoLoaderComponent } from 'app/components/adm-element-container/adm-photo-loader/adm-photo-loader.component';

@Directive({ selector: '[adm-input-element]' })
export class AdmInputElementDirective implements OnInit, OnChanges {
  @Input() ngModel;

  focused = new BSubject(false);
  touched = new BSubject(false);
  value = new BSubject('');

  constructor(public el: ElementRef) {}

  ngOnInit() {}

  @HostListener('blur')
  onBlur() {
    this.focused.next(false);
  }

  @HostListener('ngModelChange', ['$event'])
  onModelChange(value) {
    this.value.next(value);
  }

  ngOnChanges(changes) {
    if (changes.ngModel) this.value.next(changes.ngModel.currentValue);
  }

  clear() {
    this.el.nativeElement.value = '';
    this.value.next('');
    this.el.nativeElement.focus();
  }
}

@Directive({ selector: '[adm-datepicker-element]' })
export class AdmDatepickerDirective implements OnInit, OnChanges {
  @Input() value;
  focused = new BSubject(false);
  touched = new BSubject(false);

  constructor(public el: ElementRef) {}

  ngOnInit() {}

  ngOnChanges(changes: SimpleChanges) {}

  clear() {
    this.el.nativeElement.value = '';
  }

  @HostListener('focus')
  onFocus() {
    this.focused.next(true);
    this.touched.next(true);
  }

  @HostListener('blur')
  onBlur() {
    this.focused.next(false);
  }
}

@Directive({ selector: '[adm-select-element]' })
export class AdmSelectElementDirective implements OnInit, OnChanges {
  @Input() value;
  focused = new BSubject(false);
  touched = new BSubject(false);

  constructor(public el: ElementRef) {}

  ngOnInit() {}

  ngOnChanges(changes: SimpleChanges) {}

  clear() {
    this.el.nativeElement.value = '';
  }

  @HostListener('focus')
  onFocus() {
    this.focused.next(true);
    this.touched.next(true);
  }

  @HostListener('blur')
  onBlur() {
    this.focused.next(false);
  }
}

@Directive({ selector: '[adm-checkbox-element]' })
export class AdmCheckboxElementDirective implements OnInit, OnChanges {
  @Input() ngModel;

  focused = new BSubject(false);
  touched = new BSubject(false);
  value = new BSubject('');

  ngOnInit() {
    this.value.next(this.ngModel);
    if (this.ngModel) this.touched.next(true);
  }

  @HostListener('focus')
  onFocus() {
    this.focused.next(true);
    this.touched.next(true);
  }

  @HostListener('blur')
  onBlur() {
    this.focused.next(false);
  }

  @HostListener('ngModelChange', ['$event'])
  onModelChange(value) {
    this.value.next(value);
  }

  ngOnChanges(changes) {
    if (changes.ngModel) this.value.next(changes.ngModel.currentValue);
  }
}

@Component({
  selector: 'adm-element-container',
  templateUrl: './adm-element-container.component.html',
  styleUrls: ['./adm-element-container.component.scss'],
})
export class AdmElementContainerComponent implements OnInit, OnDestroy {
  @ContentChild(AdmInputElementDirective, { static: true }) input: AdmInputElementDirective;
  @ContentChild(AdmSelectElementDirective, { static: true }) select: AdmSelectElementDirective;
  @ContentChild(AdmCheckboxElementDirective, { static: true }) checkbox: AdmCheckboxElementDirective;
  @ContentChild(AdmPhotoLoaderComponent, { static: true }) photo: AdmPhotoLoaderComponent;
  @ContentChild(AdmDatepickerDirective, { static: true }) date: AdmDatepickerDirective;

  element;

  @Input() validators: Array<(value) => string> = [];
  @Input() label: string;
  @Input() icon: string;
  validationError: string;

  @Input() class;
  state: 'clear' | 'focused' | 'valid' | 'invalid' | 'validating' = 'clear';
  @HostBinding('class')
  get classes() {
    return this.class + ' ' + this.state;
  }

  constructor() {}

  subscription: Subscription;

  async ngOnInit() {
    if (this.photo) {
      this.element = this.photo;
      this.subscription = this.element.crop.subscribe((v) => {
        this.state = !isNil(v) ? 'valid' : 'clear';
      });
    }

    if (this.checkbox) {
      this.element = this.checkbox;
      this.subscription = this.element.value.subscribe((v) => {
        this.state = v ? 'valid' : 'clear';
      });
    }

    if (this.select || this.input || this.date) {
      this.element = this.select || this.input || this.date;
      this.subscription = combineLatest(this.element.focused, this.element.touched).subscribe(async (v: any[]) => {
        const [focused, touched] = v;
        if (focused) {
          this.state = 'focused';
          this.validationError = '';
        } else {
          if (touched) {
            setTimeout(async () => await this.validate(), 200);
          } else {
            this.state = 'clear';
          }
        }
      });
    }
  }

  async validate() {
    const value = this.select || this.date ? this.element.value : this.element.value.getValue();
    this.state = 'validating';
    for (let v of this.validators) {
      this.validationError = await v(value);
      if (this.validationError) {
        this.state = 'invalid';
        return true;
      }
    }
    this.state = !isNil(value) ? 'valid' : 'clear';
    return false;
  }

  clear() {
    if (this.input || this.select) this.element.clear();
  }

  async ngOnDestroy() {
    if (this.subscription) this.subscription.unsubscribe();
  }
}
