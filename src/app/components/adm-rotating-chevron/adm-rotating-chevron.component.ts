import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'adm-rotating-chevron',
  templateUrl: './adm-rotating-chevron.component.html',
  styleUrls: ['./adm-rotating-chevron.component.scss'],
})
export class AdmRotatingChevronComponent implements OnInit {
  @Input() down = true;

  constructor() {}

  async ngOnInit() {}
}
