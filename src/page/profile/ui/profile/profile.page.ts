import {Component, computed, inject, OnInit, signal} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MyProfileStore } from '../../../../shared/stores';
import { AuthStore } from '../../../../shared/stores';
import { Avatar } from 'primeng/avatar';
import { Card } from 'primeng/card';
import { Button } from 'primeng/button';
import { Skeleton } from 'primeng/skeleton';
import {GenderEnum, ProfileEntity} from '../../../../entities/profile';
import {PrimeTemplate} from 'primeng/api';

@Component({
  selector: 'app-profile',
  imports: [CommonModule, Avatar, Card, Button, Skeleton, PrimeTemplate],
  standalone: true,
  templateUrl: './profile.page.html',
  styleUrl: './profile.page.css'
})
export class ProfilePage implements OnInit {
  readonly profileStore = inject(MyProfileStore);
  readonly authStore = inject(AuthStore);

  // Loading state for profile data
  isLoadingProfile = signal(true);

  ngOnInit(): void {
    this.loadProfile();
  }

  private async loadProfile(): Promise<void> {
    const userId = this.authStore.userId();

    if (userId) {
      this.isLoadingProfile.set(true);
      try {
        await this.profileStore.loadProfile(userId);
      } catch (error) {
        console.error('Error loading profile:', error);
      } finally {
        this.isLoadingProfile.set(false);
      }
    } else {
      console.warn('No userId available for profile loading');
      this.isLoadingProfile.set(false);
    }
  }

  // Signals for template
  profile = this.profileStore.profile;
  profileImageUrl = this.profileStore.profileImageUrl;
  fullName = this.profileStore.fullName;
  displayName = this.profileStore.displayName;
  userInitials = this.profileStore.userInitials;
  isLoading = computed(() => this.profileStore.isLoading() || this.isLoadingProfile());
  hasError = computed(() => !!this.profileStore.error());
  errorMessage = this.profileStore.error;

  // Actions
  async onRefreshProfile(): Promise<void> {
    const userId = this.authStore.userId();
    if (userId) {
      await this.loadProfile();
    }
  }

  onEditProfile(): void {
    // TODO: Implement edit profile functionality
    console.log('Edit profile clicked - Coming soon!');
  }

  // Additional methods for profile management
  async onUpdateProfile(updates: Partial<ProfileEntity>): Promise<void> {
    const currentProfile = this.profile();
    if (!currentProfile) {
      console.warn('No profile available to update');
      return;
    }

    try {
      const updatedProfile = { ...currentProfile, ...updates };
      await this.profileStore.updateProfile(currentProfile.id, updatedProfile);
      console.log('Profile updated successfully');
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  }

  async onDeleteProfile(): Promise<void> {
    const currentProfile = this.profile();
    if (!currentProfile) {
      console.warn('No profile available to delete');
      return;
    }

    if (confirm('¿Estás seguro de que deseas eliminar este perfil? Esta acción no se puede deshacer.')) {
      try {
        await this.profileStore.deleteProfile(currentProfile.id);
        console.log('Profile deleted successfully');
      } catch (error) {
        console.error('Error deleting profile:', error);
      }
    }
  }

  protected readonly GenderEnum = GenderEnum;
}
