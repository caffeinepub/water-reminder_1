import Map "mo:core/Map";
import Nat "mo:core/Nat";
import List "mo:core/List";

module {
  type WaterEntry = {
    timestamp : Int;
    amount : Nat;
  };

  type WeightEntry = {
    timestamp : Int;
    weight : Float;
  };

  type Reminder = {
    id : Nat;
    time : Nat;
    daysOfWeek : [Bool];
    enabled : Bool;
    sound : Bool;
    vibration : Bool;
    alertType : Text;
  };

  type NightMode = {
    enabled : Bool;
    startTime : Nat;
    endTime : Nat;
    muteReminders : Bool;
  };

  type OldData = {
    dailyGoal : Nat;
    currentCount : ?Nat;
    entries : List.List<WaterEntry>;
    weightHistory : List.List<WeightEntry>;
    reminders : Map.Map<Nat, Reminder>;
    nextReminderId : Nat;
    nightMode : NightMode;
    reminderSound : Text;
    reminderMode : Text;
    missedReminderAlerts : Bool;
    units : Text;
    language : Text;
    wakeUpTime : Nat;
    sleepTime : Nat;
  };

  // Old actor type corresponding to legacy persistent variables.
  type OldActor = {
    dataStore : Map.Map<Nat, OldData>;
  };

  // New actor type with persistent data only.
  type NewActor = {
    waterEntries : Map.Map<Nat, List.List<WaterEntry>>;
    weightEntries : Map.Map<Nat, List.List<WeightEntry>>;
    reminders : Map.Map<Nat, Map.Map<Nat, Reminder>>;
    nightModes : Map.Map<Nat, NightMode>;
    settings : Map.Map<Nat, NewSettings>;
  };

  type NewSettings = {
    dailyGoal : Nat;
    reminderSound : Text;
    reminderMode : Text;
    missedReminderAlerts : Bool;
    units : Text;
    themeMode : Text;
    language : Text;
    wakeUpTime : ?Nat;
    sleepTime : ?Nat;
    nextReminderId : Nat;
    hasDailyGoal : Bool;
  };

  // Migration function called by the main actor via the with-clause.
  public func run(old : OldActor) : NewActor {
    // Transform old dataStore to new structure
    let waterEntries = Map.empty<Nat, List.List<WaterEntry>>();
    let weightEntries = Map.empty<Nat, List.List<WeightEntry>>();
    let reminders = Map.empty<Nat, Map.Map<Nat, Reminder>>();
    let nightModes = Map.empty<Nat, NightMode>();
    let settings = Map.empty<Nat, NewSettings>();

    for ((userId, oldData) in old.dataStore.entries()) {
      waterEntries.add(userId, oldData.entries);
      weightEntries.add(userId, oldData.weightHistory);
      let reminderMap = Map.empty<Nat, Reminder>();
      for ((reminderId, reminder) in oldData.reminders.entries()) {
        reminderMap.add(reminderId, reminder);
      };
      reminders.add(userId, reminderMap);
      nightModes.add(userId, oldData.nightMode);

      settings.add(
        userId,
        {
          dailyGoal = oldData.dailyGoal;
          reminderSound = oldData.reminderSound;
          reminderMode = oldData.reminderMode;
          missedReminderAlerts = oldData.missedReminderAlerts;
          units = oldData.units;
          themeMode = "light";
          language = oldData.language;
          wakeUpTime = ?oldData.wakeUpTime;
          sleepTime = ?oldData.sleepTime;
          nextReminderId = oldData.nextReminderId;
          hasDailyGoal = true;
        },
      );
    };

    {
      waterEntries;
      weightEntries;
      reminders;
      nightModes;
      settings;
    };
  };
};
