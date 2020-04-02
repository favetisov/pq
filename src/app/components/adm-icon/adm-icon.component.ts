import { Component, OnInit, Input, OnChanges } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'adm-icon',
  templateUrl: './adm-icon.component.html',
  styleUrls: ['./adm-icon.component.scss'],
})
export class AdmIconComponent implements OnInit, OnChanges {
  @Input() name: string;
  url;

  constructor(private sanitizer: DomSanitizer) {}

  ngOnInit() {
    this.url = '/assets/img/icons/' + this.name + '.svg';
  }

  ngOnChanges() {
    this.url = '/assets/img/icons/' + this.name + '.svg';
  }
}
