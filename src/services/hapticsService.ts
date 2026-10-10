/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { UrgencyLevel } from '../types/spatial';

class HapticsService {
  private enabled: boolean = true;

  public setEnabled(enabled: boolean) {
    this.enabled = enabled;
  }

  public trigger(urgency: UrgencyLevel = 'informational') {
    if (!this.enabled || typeof window === 'undefined' || !('vibrate' in navigator)) {
      return;
    }

    try {
      if (urgency === 'high_priority') {
        // Urgent triple pulse
        navigator.vibrate([60, 40, 60, 40, 80]);
      } else if (urgency === 'attention') {
        // Double pulse
        navigator.vibrate([40, 50, 40]);
      } else {
        // Subtle single tap
        navigator.vibrate(30);
      }
    } catch {
      // Haptics not allowed or supported on this device/profile
    }
  }
}

export const haptics = new HapticsService();
