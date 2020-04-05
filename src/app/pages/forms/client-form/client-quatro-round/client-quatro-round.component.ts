import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'client-quatro-round',
  templateUrl: './client-quatro-round.component.html',
  styleUrls: ['./client-quatro-round.component.scss'],
})
export class ClientQuatroRoundComponent implements OnInit {
  @Input() round: any = {};
  @Input() subround: any = {};
  constructor() {}

  async ngOnInit() {}
}
