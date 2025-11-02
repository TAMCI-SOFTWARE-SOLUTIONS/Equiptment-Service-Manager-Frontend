import {
  ChangeDetectorRef,
  Component,
  computed,
  effect,
  ElementRef,
  EventEmitter,
  HostListener,
  inject,
  Input,
  OnDestroy,
  Output,
  signal,
  ViewChild
} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ButtonModule} from 'primeng/button';
import {ProgressSpinnerModule} from 'primeng/progressspinner';
import {TooltipModule} from 'primeng/tooltip';
import {NgxExtendedPdfViewerModule} from 'ngx-extended-pdf-viewer';
import {
  DEFAULT_PREVIEW_CONFIG,
  PreviewConfig,
  PreviewFile,
  PreviewFileType
} from '../../model/types/file-preview-modal.types';

@Component({
  selector: 'app-file-preview-modal',
  standalone: true,
  imports: [
    CommonModule,
    ButtonModule,
    ProgressSpinnerModule,
    TooltipModule,
    NgxExtendedPdfViewerModule
  ],
  templateUrl: './file-preview-modal.component.html',
  styleUrl: './file-preview-modal.component.css'
})
export class FilePreviewModalComponent implements OnDestroy {
  private cdr = inject(ChangeDetectorRef);

  @ViewChild('contentContainer') contentContainer!: ElementRef<HTMLDivElement>;
  @ViewChild('imageElement') imageElement!: ElementRef<HTMLImageElement>;

  @Input() set show(value: boolean) {
    this._visible.set(value);
    if (value) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  }
  @Input() set fileList(value: PreviewFile[]) {
    this._files.set(value);

    if (value.length > 0) {
      const firstFile = value[0];
      this.currentFile.set(firstFile);
      this.currentFileUrl.set(firstFile.url || null);
      this.error.set(null);
      this.isLoading.set(false);
      this.cdr.detectChanges();
    }
  }
  @Input() set initialIndex(value: number) {
    const files = this.allFiles();
    if (value >= 0 && value < files.length) {
      this.selectFile(files[value]);
    }
  }
  @Input() config: Partial<PreviewConfig> = {};

  @Output() closeModal = new EventEmitter<void>();
  @Output() fileChange = new EventEmitter<PreviewFile>();
  @Output() downloadFile = new EventEmitter<PreviewFile>();
  @Output() errorOccurred = new EventEmitter<string>();

  private _visible = signal(false);
  private _files = signal<PreviewFile[]>([]);
  readonly isVisible = computed(() => this._visible());
  readonly allFiles = computed(() => this._files());
  readonly currentFile = signal<PreviewFile | null>(null);
  readonly currentFileUrl = signal<string | null>(null);
  readonly isLoading = signal(false);
  readonly error = signal<string | null>(null);
  readonly isMobile = signal(window.innerWidth < 768);
  readonly isFullscreenActive = signal(false);
  readonly zoomLevel = signal(1);
  readonly isDragging = signal(false);
  readonly dragStart = signal({ x: 0, y: 0 });
  readonly imagePosition = signal({ x: 0, y: 0 });

  readonly mergedConfig = computed(() => ({
    ...DEFAULT_PREVIEW_CONFIG,
    ...this.config
  }));
  readonly currentFileIndex = computed(() => {
    const current = this.currentFile();
    if (!current) return -1;
    return this._files().findIndex(f => f.fileEntity.id === current.fileEntity.id);
  });
  readonly isFirst = computed(() => this.currentFileIndex() === 0);
  readonly isLast = computed(() => this.currentFileIndex() === this.allFiles().length - 1);
  readonly canNavigate = computed(() => this.allFiles().length > 1);
  readonly fileType = computed((): PreviewFileType => {
    const file = this.currentFile();
    if (!file) return 'unknown';
    return file.type;
  });
  readonly isImage = computed(() => this.fileType() === 'image');
  //readonly isVideo = computed(() => this.fileType() === 'video');
  //readonly isPdf = computed(() => this.fileType() === 'pdf');
  readonly canZoom = computed(() => this.isImage() && this.mergedConfig().allowZoom);

  readonly showThumbnails = computed(() => this.canNavigate() && this.mergedConfig().showThumbnails && !this.isMobile());

  constructor() {
    effect(() => {
      const handleResize = () => {
        this.isMobile.set(window.innerWidth < 768);
      };
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    });

    effect(() => {
      if (this.isVisible() && this.isMobile() && this.mergedConfig().allowFullscreen) {
        setTimeout(() => this.enterFullscreen(), 100);
      }
    });
  }

  ngOnDestroy(): void {
    this.exitFullscreen();
    this.revokeCurrentUrl();
    document.body.style.overflow = '';
  }

  @HostListener('window:keydown', ['$event'])
  handleKeyboard(event: KeyboardEvent): void {
    if (!this.isVisible()) return;

    const config = this.mergedConfig();

    switch (event.key) {
      case 'Escape':
        if (config.closeOnEsc) {
          if (this.isFullscreenActive()) {
            this.exitFullscreen();
          } else {
            this.close();
          }
        }
        break;

      case 'ArrowLeft':
        event.preventDefault();
        this.previous();
        break;

      case 'ArrowRight':
        event.preventDefault();
        this.next();
        break;

      case 'f':
      case 'F':
        if (config.allowFullscreen) {
          event.preventDefault();
          this.toggleFullscreen();
        }
        break;

      case '+':
      case '=':
        if (this.canZoom()) {
          event.preventDefault();
          this.zoomIn();
        }
        break;

      case '-':
      case '_':
        if (this.canZoom()) {
          event.preventDefault();
          this.zoomOut();
        }
        break;

      case '0':
        if (this.canZoom()) {
          event.preventDefault();
          this.resetZoom();
        }
        break;
    }
  }

  selectFile(file: PreviewFile): void {
    if (!file) return;

    this.resetZoom();
    this.imagePosition.set({ x: 0, y: 0 });
    this.error.set(null);

    this.currentFile.set(file);
    this.currentFileUrl.set(file.url || null);

    if (!file.url) {
      this.isLoading.set(true);
    }

    this.fileChange.emit(file);
    this.cdr.detectChanges();
  }

  private revokeCurrentUrl(): void {
    const url = this.currentFileUrl();
    if (url && url.startsWith('blob:')) {
      URL.revokeObjectURL(url);
    }
    this.currentFileUrl.set(null);
  }

  previous(): void {
    if (this.isFirst()) return;
    const files = this.allFiles();
    const currentIdx = this.currentFileIndex();
    this.selectFile(files[currentIdx - 1]);
  }

  next(): void {
    if (this.isLast()) return;
    const files = this.allFiles();
    const currentIdx = this.currentFileIndex();
    this.selectFile(files[currentIdx + 1]);
  }

  zoomIn(): void {
    if (!this.canZoom()) return;
    const current = this.zoomLevel();
    const newZoom = Math.min(current + 0.25, 3);
    this.zoomLevel.set(newZoom);
  }

  zoomOut(): void {
    if (!this.canZoom()) return;
    const current = this.zoomLevel();
    const newZoom = Math.max(current - 0.25, 0.5);
    this.zoomLevel.set(newZoom);
  }

  resetZoom(): void {
    this.zoomLevel.set(1);
    this.imagePosition.set({ x: 0, y: 0 });
  }

  onDoubleClick(): void {
    if (!this.canZoom()) return;
    if (this.zoomLevel() === 1) {
      this.zoomLevel.set(2);
    } else {
      this.resetZoom();
    }
  }

  onMouseDown(event: MouseEvent): void {
    if (!this.isImage() || this.zoomLevel() <= 1) return;

    this.isDragging.set(true);
    const pos = this.imagePosition();
    this.dragStart.set({
      x: event.clientX - pos.x,
      y: event.clientY - pos.y
    });
    event.preventDefault();
  }

  @HostListener('window:mousemove', ['$event'])
  onMouseMove(event: MouseEvent): void {
    if (!this.isDragging()) return;

    const start = this.dragStart();
    this.imagePosition.set({
      x: event.clientX - start.x,
      y: event.clientY - start.y
    });
  }

  @HostListener('window:mouseup')
  onMouseUp(): void {
    this.isDragging.set(false);
  }

  private touchStartY = 0;
  private touchStartTime = 0;

  onTouchStart(event: TouchEvent): void {
    this.touchStartY = event.touches[0].clientY;
    this.touchStartTime = Date.now();
  }

  onTouchEnd(event: TouchEvent): void {
    if (!this.isMobile()) return;

    const touchEndY = event.changedTouches[0].clientY;
    const deltaY = touchEndY - this.touchStartY;
    const deltaTime = Date.now() - this.touchStartTime;

    if (deltaY > 100 && deltaTime < 300 && this.zoomLevel() === 1) {
      this.close();
    }
  }

  toggleFullscreen(): void {
    if (this.isFullscreenActive()) {
      this.exitFullscreen();
    } else {
      this.enterFullscreen();
    }
  }

  private enterFullscreen(): void {
    const elem = this.contentContainer?.nativeElement;
    if (!elem) return;

    if (elem.requestFullscreen) {
      elem.requestFullscreen().then();
    } else if ((elem as any).webkitRequestFullscreen) {
      (elem as any).webkitRequestFullscreen();
    } else if ((elem as any).msRequestFullscreen) {
      (elem as any).msRequestFullscreen();
    }

    this.isFullscreenActive.set(true);
  }

  private exitFullscreen(): void {
    if (document.fullscreenElement) {
      document.exitFullscreen().then();
    }
    this.isFullscreenActive.set(false);
  }

  @HostListener('document:fullscreenchange')
  onFullscreenChange(): void {
    this.isFullscreenActive.set(!!document.fullscreenElement);
  }

  close(): void {
    this.exitFullscreen();
    this.closeModal.emit();
  }

  download(): void {
    const file = this.currentFile();
    if (!file) return;
    this.downloadFile.emit(file);
  }

  retry(): void {
    const file = this.currentFile();
    if (file) {
      this.selectFile(file);
    }
  }

  onBackdropClick(event: MouseEvent): void {
    if (!this.mergedConfig().closeOnBackdrop) return;
    if (event.target === event.currentTarget) {
      this.close();
    }
  }

  formatSize(bytes: number): string {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  }

  getImageTransform(): string {
    const zoom = this.zoomLevel();
    const pos = this.imagePosition();
    return `scale(${zoom}) translate(${pos.x / zoom}px, ${pos.y / zoom}px)`;
  }

  getCurrentIndex(): number {
    return this.currentFileIndex();
  }
}
