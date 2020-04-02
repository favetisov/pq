import {
  Component,
  OnInit,
  Input,
  HostBinding,
  ViewChild,
  Output,
  EventEmitter,
  ElementRef,
  OnChanges,
} from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { ImageCroppedEvent, ImageCropperComponent } from 'ngx-image-cropper';

@Component({
  selector: 'adm-photo-loader',
  templateUrl: './adm-photo-loader.component.html',
  styleUrls: ['./adm-photo-loader.component.scss'],
})
export class AdmPhotoLoaderComponent implements OnInit, OnChanges {
  @Input() originalUrl: string;
  @Input() format = 'jpg';
  @Input() aspectRatio;
  @Input() minWidth = 200;
  @Input() resizeToWidth = 0;
  maintainAspectRatio = true;

  image64: string;

  @ViewChild(ImageCropperComponent) cropper: ImageCropperComponent;
  @ViewChild('fileInput', { static: true }) fileInput: ElementRef;
  @HostBinding('class.dragover') inputDragover = false;

  state: 'clear' | 'loading' | 'loaded' | 'failed' = 'clear';

  @Output() crop = new EventEmitter<string>();
  @Output() fileSelected = new EventEmitter<string>();
  value = new BehaviorSubject('');
  constructor() {}

  async ngOnInit() {
    if (this.originalUrl) {
      this.loadOriginal();
    }
    if (!this.aspectRatio) {
      this.aspectRatio = 1;
      this.maintainAspectRatio = false;
    }
  }

  ngOnChanges(changes) {
    if (changes.originalUrl) this.loadOriginal();
  }

  private async loadOriginal() {
    this.state = 'loading';
    try {
      this.image64 = await this.loadUrl(this.originalUrl);
      this.state = this.image64 ? 'loaded' : 'clear';
    } catch (e) {
      this.state = 'clear';
    }
  }

  private async loadUrl(url): Promise<any> {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.onload = () => {
        if (xhr.status != 200) return resolve('');
        const reader = new FileReader();
        reader.onloadend = () => {
          resolve(reader.result);
        };
        reader.readAsDataURL(xhr.response);
      };
      xhr.onerror = () => resolve('');
      xhr.open('GET', url);
      xhr.responseType = 'blob';
      xhr.send();
    });
  }

  onFileChanged(event) {
    this.state = 'loading';
    const fileReader = new FileReader();
    fileReader.onload = (event: any) => {
      this.image64 = event.target.result;
    };
    fileReader.readAsDataURL(event.target.files[0]);
    this.fileSelected.emit(event.target.files[0]);
  }

  onDrop() {
    this.inputDragover = false;
  }

  onCrop(event: ImageCroppedEvent) {
    this.crop.emit(event.base64);
    this.value.next(event.base64);
  }

  onLoad() {
    this.state = 'loaded';
  }

  onLoadFailed() {
    this.state = 'failed';
  }

  clean() {
    this.image64 = null;
    this.fileInput.nativeElement.value = '';
    this.state = 'clear';
  }

  rotateLeft() {
    // this.cropper.rotateLeft();
  }

  rotateRight() {
    // this.cropper.rotateRight();
  }
}
