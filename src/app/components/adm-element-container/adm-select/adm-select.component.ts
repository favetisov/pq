import {
  Component,
  ContentChild,
  Directive,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { filter as filterRx } from 'rxjs/operators';
import { filter } from 'app/tools/filter';
import { isNil } from 'lodash';

@Directive({ selector: '[adm-select-label-tmp]' })
export class AdmSelectLabelTmpDirective {}

@Directive({ selector: '[adm-select-option-tmp]' })
export class AdmSelectOptionTmpDirective {}

@Component({
  selector: 'adm-select',
  templateUrl: './adm-select.component.html',
  styleUrls: ['./adm-select.component.scss'],
})
export class AdmSelectComponent implements OnInit, OnChanges {
  @Input() value;
  @Input() options: Array<any> = [];
  foundOptions = [];

  @Input() placeholder: string;
  @Input() filterFields: Array<any>;
  @Input() searchFn: (query: string, items: any) => Promise<Array<any>>;
  @Input() virtual;
  @Input() hasClearButton = true;

  @Output() selected = new EventEmitter();
  @Output() focus = new EventEmitter();
  @Output() blur = new EventEmitter();
  @ViewChild('input', { static: true }) input;

  query = '';

  open$ = new BehaviorSubject(false);

  @ContentChild(AdmSelectLabelTmpDirective, { read: TemplateRef })
  labelTemplate: TemplateRef<any>;
  @ContentChild(AdmSelectOptionTmpDirective, { read: TemplateRef })
  optionTemplate: TemplateRef<any>;

  selectedOptionIdx = -1;

  isNil = isNil;

  ngOnInit() {
    this.search();
    this.open$.pipe(filterRx(Boolean)).subscribe((open) => {
      setTimeout(() => this.input.nativeElement.focus(), 75);
    });
  }

  ngOnChanges(changes) {
    if (changes.options) this.search();
  }

  select(option) {
    this.query = '';
    this.search();
    this.value = option;
    this.open$.next(false);
    this.selected.next(option);
  }

  onInputBlur() {
    // this.selectedOptionIdx = -1;
    // setTimeout(() => this.open$.next(false), 100);
    this.blur.next();
  }

  async search() {
    if (this.searchFn) {
      this.foundOptions = await this.searchFn(this.query, this.options);
    } else if (this.filterFields) {
      this.foundOptions = filter(this.options, this.query, this.filterFields);
    } else {
      this.foundOptions = this.options;
    }
  }

  increaseOptionIdx() {
    if (this.selectedOptionIdx < this.foundOptions.length - 1) {
      this.selectedOptionIdx++;
    } else {
      this.selectedOptionIdx = this.foundOptions.length - 1;
    }
  }

  decreaseOptionIdx() {
    if (this.selectedOptionIdx > 0) {
      this.selectedOptionIdx--;
    } else {
      this.selectedOptionIdx = 0;
    }
  }

  selectByEnter() {
    if (this.selectedOptionIdx > -1) {
      this.select(this.foundOptions[this.selectedOptionIdx]);
    }
  }
}
