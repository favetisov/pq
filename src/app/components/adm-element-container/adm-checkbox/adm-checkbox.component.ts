import { Component, EventEmitter, HostListener, Input, OnChanges, OnInit, Output } from '@angular/core';

@Component({
  selector: 'adm-checkbox',
  templateUrl: './adm-checkbox.component.html',
  styleUrls: ['./adm-checkbox.component.scss'],
})
export class AdmCheckboxComponent implements OnInit {
  @Input() value: boolean;
  @Input() title: string;
  @Input() disabled: boolean;

  @Output() toggle = new EventEmitter();

  @HostListener('click')
  onClick() {
    if (!this.disabled) {
      this.value = !this.value;
      this.toggle.emit(this.value);
    }
  }

  ngOnInit() {}
}
