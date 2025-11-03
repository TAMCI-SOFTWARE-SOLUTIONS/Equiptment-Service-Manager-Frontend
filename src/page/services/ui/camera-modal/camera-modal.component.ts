import {
  Component,
  computed,
  ElementRef,
  EventEmitter,
  Input,
  OnDestroy,
  Output,
  signal,
  ViewChild
} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ButtonModule} from 'primeng/button';
import {WebcamImage, WebcamInitError, WebcamModule} from 'ngx-webcam';
import {Subject} from 'rxjs';
import {Tooltip} from 'primeng/tooltip';

export type CameraMode = 'photo' | 'video';
export type CaptureState = 'ready' | 'captured' | 'recording';

@Component({
  selector: 'app-camera-modal',
  standalone: true,
  imports: [
    CommonModule,
    ButtonModule,
    WebcamModule,
    Tooltip
  ],
  templateUrl: './camera-modal.component.html',
  styleUrl: './camera-modal.component.css'
})
export class CameraModalComponent implements OnDestroy {
  @ViewChild('videoPlayer') videoPlayer: ElementRef<HTMLVideoElement> | undefined;

  @Input() set show(value: boolean) {
    const wasVisible = this.isVisible();
    this.isVisible.set(value);

    if (value && !wasVisible) {
      Promise.resolve().then(() => {this.initializeCamera().then();});
    } else if (!value && wasVisible) {this.cleanup();}
  }
  @Input() set mode(value: CameraMode) {this.cameraMode.set(value);}
  @Output() closeModal = new EventEmitter<void>();
  @Output() captureConfirmed = new EventEmitter<File>();

  readonly isVisible = signal(false);
  readonly cameraMode = signal<CameraMode>('photo');
  readonly captureState = signal<CaptureState>('ready');
  readonly isRecording = signal(false);
  readonly recordingTime = signal(0);
  readonly capturedImagePreview = signal<string | null>(null);
  readonly capturedVideoPreviewUrl = signal<string | null>(null);
  readonly cameraError = signal<string | null>(null);
  readonly isInitializing = signal(false);
  readonly cameraTrigger = new Subject<void>();
  readonly switchCamera = new Subject<boolean | string>();
  private capturedVideoBlob: Blob | null = null;
  private mediaRecorder: MediaRecorder | null = null;
  private recordedChunks: Blob[] = [];
  protected videoStream: MediaStream | null = null;
  private recordingInterval: any = null;

  readonly isPhotoMode = computed(() => this.cameraMode() === 'photo');
  readonly isVideoMode = computed(() => this.cameraMode() === 'video');
  readonly isReady = computed(() => this.captureState() === 'ready');
  readonly isCaptured = computed(() => this.captureState() === 'captured');
  readonly title = computed(() => this.isPhotoMode() ? 'Capturar Foto' : 'Grabar Video');
  readonly recordingTimeFormatted = computed(() => {
    const seconds = this.recordingTime();
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  });

  ngOnDestroy(): void {
    this.cleanup();
  }

  protected async initializeCamera(): Promise<void> {
    if (this.isVideoMode()) {await this.initializeVideoStream();}
  }

  private async initializeVideoStream(): Promise<void> {
    this.isInitializing.set(true);
    this.cameraError.set(null);

    try {
      if (this.videoStream) {
        this.stopMediaStream();
      }

      this.videoStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment',
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        },
        audio: true
      });

      await this.waitForVideoPlayer();

      if (this.videoPlayer) {
        const videoElement = this.videoPlayer.nativeElement;
        videoElement.srcObject = this.videoStream;

        await new Promise<void>((resolve, reject) => {
          const timeout = setTimeout(() => {
            reject(new Error('Timeout waiting for video metadata'));
          }, 5000);

          videoElement.onloadedmetadata = () => {
            clearTimeout(timeout);

            videoElement.play()
              .then(() => {resolve();})
              .catch((error) => {
                console.error('❌ Error al reproducir video:', error);
                videoElement.muted = true;
                videoElement.play()
                  .then(() => {
                    console.log('✅ Video reproduciendo (muted)');
                    resolve();
                  })
                  .catch(() => {
                    reject(error);
                  });
              });
          };

          videoElement.onerror = (error) => {
            clearTimeout(timeout);
            reject(error);
          };
        });
      }

      this.isInitializing.set(false);

    } catch (error: any) {
      console.error('❌ Error accessing camera:', error);

      let errorMessage = 'No se pudo acceder a la cámara.';

      if (error.name === 'NotAllowedError') {
        errorMessage = 'Permiso denegado. Por favor permite el acceso a la cámara y micrófono.';
      } else if (error.name === 'NotFoundError') {
        errorMessage = 'No se encontró cámara o micrófono.';
      } else if (error.name === 'NotReadableError') {
        errorMessage = 'La cámara está siendo usada por otra aplicación.';
      } else if (error.message) {
        errorMessage = error.message;
      }

      this.cameraError.set(errorMessage);
      this.isInitializing.set(false);

      this.stopMediaStream();
    }
  }

  private async waitForVideoPlayer(maxAttempts: number = 30): Promise<void> {
    let attempts = 0;

    while (!this.videoPlayer && attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 100));
      attempts++;
    }

    if (!this.videoPlayer) {
      throw new Error('Video player no inicializado');
    }
  }

  private async ensureVideoStreamReady(): Promise<boolean> {

    if (!this.videoStream) {
      try {
        await this.initializeVideoStream();

        await new Promise(resolve => setTimeout(resolve, 500));

        if (!this.videoStream) {
          console.error('❌ Stream no se pudo inicializar');
          return false;
        }
      } catch (error) {
        console.error('❌ Error al inicializar stream:', error);
        return false;
      }
    }

    const videoTracks = this.videoStream.getVideoTracks();
    //const audioTracks = this.videoStream.getAudioTracks();

    return videoTracks.length > 0 && videoTracks[0].readyState === 'live';
  }

  handleInitError(_: WebcamInitError | Error): void {
    this.cameraError.set('Error al inicializar la cámara');
  }

  capturePhoto(): void {
    if (!this.isPhotoMode()) return;
    this.cameraTrigger.next();
  }

  handleImageCapture(webcamImage: WebcamImage): void {
    this.capturedImagePreview.set(webcamImage.imageAsDataUrl);
    this.captureState.set('captured');
  }

  async startRecording(): Promise<void> {

    if (!this.isVideoMode()) {
      console.error('❌ No está en modo video');
      return;
    }

    const streamReady = await this.ensureVideoStreamReady();

    if (!streamReady || !this.videoStream) {
      console.error('❌ Stream no está listo');
      this.cameraError.set('Error: No se pudo inicializar la cámara. Intenta de nuevo.');
      return;
    }

    if (!this.videoPlayer) {
      console.error('❌ Video Player no está disponible');
      this.cameraError.set('Error: Video player no inicializado');
      return;
    }

    const videoElement = this.videoPlayer.nativeElement;

    if (!videoElement.srcObject) {
      videoElement.srcObject = this.videoStream;

      await new Promise(resolve => setTimeout(resolve, 200));
    }

    this.recordedChunks = [];
    this.recordingTime.set(0);

    try {
      const supportedMimeTypes = [
        'video/webm;codecs=vp9',
        'video/webm;codecs=vp8',
        'video/webm',
        'video/mp4'
      ];

      let selectedMimeType = '';

      for (const mimeType of supportedMimeTypes) {
        if (MediaRecorder.isTypeSupported(mimeType)) {
          selectedMimeType = mimeType;
          console.log('✅ Codec soportado:', mimeType);
          break;
        }
      }

      if (!selectedMimeType) {
        console.error('❌ Ningún codec soportado');
        this.cameraError.set('Error: Tu navegador no soporta grabación de video');
        return;
      }

      this.mediaRecorder = new MediaRecorder(this.videoStream, {
        mimeType: selectedMimeType,
        videoBitsPerSecond: 2500000
      });


      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {this.recordedChunks.push(event.data);}
      };

      this.mediaRecorder.onstop = () => {

        if (this.recordedChunks.length === 0) {
          console.error('❌ No se grabaron datos');
          this.cameraError.set('Error: No se grabó ningún dato');
          this.isRecording.set(false);
          this.captureState.set('ready');
          return;
        }

        const blob = new Blob(this.recordedChunks, { type: 'video/webm' });

        this.capturedVideoBlob = blob;
        this.capturedVideoPreviewUrl.set(URL.createObjectURL(blob));
        this.captureState.set('captured');
        this.stopMediaStream();
      };

      this.mediaRecorder.onerror = (event: any) => {
        console.error('❌ MediaRecorder error:', event);
        this.cameraError.set('Error durante la grabación');
        this.isRecording.set(false);
        this.captureState.set('ready');
      };

      this.mediaRecorder.start(100);

      this.isRecording.set(true);
      this.captureState.set('recording');

      this.recordingInterval = setInterval(() => {
        this.recordingTime.update(time => time + 1);
      }, 1000);

    } catch (error: any) {
      console.error('❌ Error al crear MediaRecorder:', error);
      this.cameraError.set(`Error: ${error.message}`);
      this.isRecording.set(false);
      this.captureState.set('ready');
    }
  }

  stopRecording(): void {

    if (this.mediaRecorder) {
      if (this.mediaRecorder.state === 'recording') {
        this.mediaRecorder.stop();
        //console.log('✅ MediaRecorder.stop() llamado');
      } else {
        //console.log('⚠️ MediaRecorder no está en estado recording:', this.mediaRecorder.state);
      }
    } else {
      console.error('❌ No hay MediaRecorder para detener');
    }

    this.isRecording.set(false);

    if (this.recordingInterval) {
      clearInterval(this.recordingInterval);
      this.recordingInterval = null;
    }
  }

  confirmCapture(): void {
    let file: File | null = null;

    if (this.capturedImagePreview()) {
      file = this.convertBase64ToFile(
        this.capturedImagePreview()!,
        `photo-${Date.now()}.jpg`
      );
    } else if (this.capturedVideoBlob) {
      file = new File(
        [this.capturedVideoBlob],
        `video-${Date.now()}.webm`,
        { type: 'video/webm' }
      );
    }

    if (file) {
      this.captureConfirmed.emit(file);
      this.close();
    }
  }

  discardCapture(): void {
    this.capturedImagePreview.set(null);

    if (this.capturedVideoPreviewUrl()) {
      URL.revokeObjectURL(this.capturedVideoPreviewUrl()!);
    }
    this.capturedVideoPreviewUrl.set(null);
    this.capturedVideoBlob = null;

    this.captureState.set('ready');
    this.recordingTime.set(0);

    if (this.isVideoMode()) {
      this.initializeVideoStream().then();
    }
  }

  close(): void {
    this.cleanup();
    this.closeModal.emit();
  }

  switchCameraMode(): void {
    this.switchCamera.next(true);
  }

  private convertBase64ToFile(base64: string, filename: string): File | null {
    try {
      const arr = base64.split(',');
      const mimeMatch = arr[0].match(/:(.*?);/);
      if (!mimeMatch) return null;

      const mime = mimeMatch[1];
      const bstr = atob(arr[1]);
      let n = bstr.length;
      const u8arr = new Uint8Array(n);

      while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
      }

      const blob = new Blob([u8arr], { type: mime });
      return new File([blob], filename, { type: mime });
    } catch (error) {
      console.error('Error converting base64 to file:', error);
      return null;
    }
  }

  private stopMediaStream(): void {
    if (this.videoStream) {
      this.videoStream.getTracks().forEach(track => track.stop());
      this.videoStream = null;
    }
  }

  private cleanup(): void {
    this.stopMediaStream();

    if (this.capturedVideoPreviewUrl()) {
      URL.revokeObjectURL(this.capturedVideoPreviewUrl()!);
    }

    if (this.recordingInterval) {
      clearInterval(this.recordingInterval);
    }

    this.capturedImagePreview.set(null);
    this.capturedVideoPreviewUrl.set(null);
    this.capturedVideoBlob = null;
    this.captureState.set('ready');
    this.isRecording.set(false);
    this.recordingTime.set(0);
    this.cameraError.set(null);
  }
}
