import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'client-school-round',
  templateUrl: './client-school-round.component.html',
  styleUrls: ['./client-school-round.component.scss'],
})
export class ClientSchoolRoundComponent implements OnInit {
  @Input() round: any = {};
  @Input() subround: any = {};
  constructor() {}

  async ngOnInit() {}
}
