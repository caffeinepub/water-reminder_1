import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { WaterDataView, WaterEntry, WeightEntry, Reminder, NightMode } from '../backend';

// Hardcoded user ID for offline usage
const USER_ID = BigInt(1);

// Water data queries
export function useWaterData() {
  const { actor, isFetching } = useActor();

  return useQuery<WaterDataView>({
    queryKey: ['waterData'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not initialized');
      return actor.getProgress(USER_ID);
    },
    enabled: !!actor && !isFetching,
  });
}

export function useDrinkLog() {
  const { actor, isFetching } = useActor();

  return useQuery<WaterEntry[]>({
    queryKey: ['drinkLog'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getDrinkLog(USER_ID);
    },
    enabled: !!actor && !isFetching,
  });
}

export function useWeightHistory() {
  const { actor, isFetching } = useActor();

  return useQuery<WeightEntry[]>({
    queryKey: ['weightHistory'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getWeightHistory(USER_ID);
    },
    enabled: !!actor && !isFetching,
  });
}

export function useReports() {
  const { actor, isFetching } = useActor();

  return useQuery({
    queryKey: ['reports'],
    queryFn: async () => {
      if (!actor) return null;
      const [daily, weekly, monthly] = await Promise.all([
        actor.getDailySummary(USER_ID),
        actor.getWeeklySummary(USER_ID),
        actor.getMonthlySummary(USER_ID),
      ]);
      return { daily, weekly, monthly };
    },
    enabled: !!actor && !isFetching,
  });
}

export function useRemindersData() {
  const { actor, isFetching } = useActor();

  return useQuery<Reminder[]>({
    queryKey: ['reminders'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getReminders(USER_ID);
    },
    enabled: !!actor && !isFetching,
  });
}

export function useNightMode() {
  const { actor, isFetching } = useActor();

  return useQuery<NightMode>({
    queryKey: ['nightMode'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not initialized');
      return actor.getNightMode(USER_ID);
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAdvancedSettings() {
  const { actor, isFetching } = useActor();

  return useQuery({
    queryKey: ['advancedSettings'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not initialized');
      return actor.getAdvancedSettings(USER_ID);
    },
    enabled: !!actor && !isFetching,
  });
}

// Mutations
export function useSetGoal() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (goal: bigint) => {
      if (!actor) throw new Error('Actor not initialized');
      return actor.setDailyGoal(USER_ID, goal);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['waterData'] });
      queryClient.invalidateQueries({ queryKey: ['reports'] });
    },
  });
}

export function useIncrementWater() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (amount: bigint) => {
      if (!actor) throw new Error('Actor not initialized');
      return actor.incrementWaterIntake(USER_ID, amount);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['waterData'] });
      queryClient.invalidateQueries({ queryKey: ['drinkLog'] });
      queryClient.invalidateQueries({ queryKey: ['reports'] });
    },
  });
}

export function useAddWeight() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (weight: number) => {
      if (!actor) throw new Error('Actor not initialized');
      return actor.addWeightEntry(USER_ID, weight);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['weightHistory'] });
    },
  });
}

export function useAddReminder() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      time: bigint;
      daysOfWeek: boolean[];
      sound: boolean;
      vibration: boolean;
      alertType: string;
    }) => {
      if (!actor) throw new Error('Actor not initialized');
      return actor.addReminder(
        USER_ID,
        data.time,
        data.daysOfWeek,
        data.sound,
        data.vibration,
        data.alertType
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reminders'] });
    },
  });
}

export function useUpdateReminder() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      reminderId: bigint;
      time: bigint;
      daysOfWeek: boolean[];
      sound: boolean;
      vibration: boolean;
      alertType: string;
    }) => {
      if (!actor) throw new Error('Actor not initialized');
      return actor.updateReminder(
        USER_ID,
        data.reminderId,
        data.time,
        data.daysOfWeek,
        data.sound,
        data.vibration,
        data.alertType
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reminders'] });
    },
  });
}

export function useToggleReminder() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { reminderId: bigint; enabled: boolean }) => {
      if (!actor) throw new Error('Actor not initialized');
      return actor.toggleReminder(USER_ID, data.reminderId, data.enabled);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reminders'] });
    },
  });
}

export function useSetNightMode() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      enabled: boolean;
      startTime: bigint;
      endTime: bigint;
      muteReminders: boolean;
    }) => {
      if (!actor) throw new Error('Actor not initialized');
      return actor.setNightMode(
        USER_ID,
        data.enabled,
        data.startTime,
        data.endTime,
        data.muteReminders
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['nightMode'] });
    },
  });
}

export function useSetAdvancedSettings() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      reminderSound: string;
      reminderMode: string;
      missedReminderAlerts: boolean;
      units: string;
      themeMode: string;
      language: string;
      wakeUpTime: bigint | null;
      sleepTime: bigint | null;
    }) => {
      if (!actor) throw new Error('Actor not initialized');
      return actor.setAdvancedSettings(
        USER_ID,
        data.reminderSound,
        data.reminderMode,
        data.missedReminderAlerts,
        data.units,
        data.themeMode,
        data.language,
        data.wakeUpTime,
        data.sleepTime
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['advancedSettings'] });
      queryClient.invalidateQueries({ queryKey: ['waterData'] });
    },
  });
}

export function useUpdateSleepWakeTimes() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { wakeUpTime: bigint; sleepTime: bigint }) => {
      if (!actor) throw new Error('Actor not initialized');
      return actor.updateSleepWakeTimes(USER_ID, data.wakeUpTime, data.sleepTime);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['advancedSettings'] });
      queryClient.invalidateQueries({ queryKey: ['waterData'] });
    },
  });
}
