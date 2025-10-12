import { Injectable } from '@angular/core';
import { EventPayloadMap } from '../events/event-payloads';

type EventCallback<T = any> = (data: T) => void;

@Injectable({
  providedIn: 'root'
})
export class EventBusService {
  private listeners: Map<string, EventCallback[]> = new Map();

  /**
   * Subscribe to an event with a specific type
   *
   * @example
   * eventBus.on(EventNames.AUTH_LOGIN, (data: AuthLoginPayload) => {
   *   console.log('User logged in:', data.userId);
   * });
   */
  on<K extends keyof EventPayloadMap>(event: K, callback: EventCallback<EventPayloadMap[K]>): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(callback);

    return () => this.off(event, callback);
  }

  /**
   * Emit an event with a specific type
   *
   * @example
   * eventBus.emit(EventNames.AUTH_LOGIN, {
   *   userId: '123',
   *   timestamp: new Date()
   * });
   */
  emit<K extends keyof EventPayloadMap>(event: K, data: EventPayloadMap[K]): void {
    console.log(`Event Bus - Emitting event: ${event}`, data);

    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Event Bus - Error in callback for event ${event}:`, error);
        }
      });
    }
  }

  /**
   * Unsubscribe from an event
   */
  off<K extends keyof EventPayloadMap>(event: K, callback: EventCallback<EventPayloadMap[K]>): void {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      const index = eventListeners.indexOf(callback);
      if (index > -1) {
        eventListeners.splice(index, 1);
      }
    }
  }

  /**
   * Remove all listeners for an event, or all listeners if not specified.
   */
  removeAllListeners(event?: keyof EventPayloadMap): void {
    if (event) {
      this.listeners.delete(event);
    } else {
      this.listeners.clear();
    }
  }

  /**
   * Get all logged events (useful for debugging)
   */
  getEvents(): string[] {
    return Array.from(this.listeners.keys());
  }

  /**
   * Check if there are listeners for a specific event
   */
  hasListeners(event: keyof EventPayloadMap): boolean {
    return this.listeners.has(event) && this.listeners.get(event)!.length > 0;
  }
}
