import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Time "mo:core/Time";
import List "mo:core/List";
import Iter "mo:core/Iter";
import Array "mo:core/Array";
import Runtime "mo:core/Runtime";
import Migration "migration";

(with migration = Migration.run)
actor {
  type WaterEntry = {
    timestamp : Time.Time;
    amount : Nat;
  };

  type WeightEntry = {
    timestamp : Time.Time;
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

  type Settings = {
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

  type WaterDataView = {
    dailyGoal : Nat;
    currentCount : ?Nat;
    entries : [WaterEntry];
    weightHistory : [WeightEntry];
    reminders : [Reminder];
    nightMode : NightMode;
    reminderSound : Text;
    themeMode : Text;
    reminderMode : Text;
    missedReminderAlerts : Bool;
    units : Text;
    language : Text;
    wakeUpTime : ?Nat;
    sleepTime : ?Nat;
  };

  let waterEntries = Map.empty<Nat, List.List<WaterEntry>>();
  let weightEntries = Map.empty<Nat, List.List<WeightEntry>>();
  let reminders = Map.empty<Nat, Map.Map<Nat, Reminder>>();
  let nightModes = Map.empty<Nat, NightMode>();
  let settings = Map.empty<Nat, Settings>();

  public shared ({ caller }) func setDailyGoal(userId : Nat, goal : Nat) : async () {
    let currentSettings = switch (settings.get(userId)) {
      case (?data) { data };
      case (null) {
        {
          dailyGoal = goal;
          reminderSound = "default";
          reminderMode = "manual";
          missedReminderAlerts = true;
          units = "ml/kg";
          themeMode = "light";
          language = "en";
          wakeUpTime = ?(7 * 60);
          sleepTime = ?(23 * 60);
          nextReminderId = 1;
          hasDailyGoal = true;
        };
      };
    };

    let newSettings = {
      currentSettings with
      dailyGoal = goal;
      hasDailyGoal = true;
    };
    settings.add(userId, newSettings);
  };

  public shared ({ caller }) func updateSleepWakeTimes(userId : Nat, wakeUpTime : ?Nat, sleepTime : ?Nat) : async () {
    let currentSettings = switch (settings.get(userId)) {
      case (null) { Runtime.trap("No data found for user.") };
      case (?data) { data };
    };

    let newSettings = {
      currentSettings with
      wakeUpTime;
      sleepTime;
    };
    settings.add(userId, newSettings);
  };

  public shared ({ caller }) func incrementWaterIntake(userId : Nat, amount : Nat) : async () {
    let currentSettings = switch (settings.get(userId)) {
      case (null) { Runtime.trap("Please set a daily goal first.") };
      case (?data) { data };
    };

    if (not currentSettings.hasDailyGoal) {
      Runtime.trap("Please set a daily goal first.");
    };

    let newEntry : WaterEntry = {
      timestamp = Time.now();
      amount;
    };

    let entriesList = switch (waterEntries.get(userId)) {
      case (?entries) { entries };
      case (null) { List.empty<WaterEntry>() };
    };

    entriesList.add(newEntry);
    waterEntries.add(userId, entriesList);
  };

  public shared ({ caller }) func getCurrentDayIntake(userId : Nat) : async Nat {
    let entriesList = switch (waterEntries.get(userId)) {
      case (?entries) { entries };
      case (null) { return 0 };
    };

    let currentTime = Time.now();
    let dayInMillis = 24 * 60 * 60 * 1_000_000_000;

    var total = 0;

    for (entry in entriesList.values()) {
      if (currentTime - entry.timestamp <= dayInMillis) {
        total += entry.amount;
      };
    };

    total;
  };

  public shared ({ caller }) func addWeightEntry(userId : Nat, weight : Float) : async () {
    let currentSettings = switch (settings.get(userId)) {
      case (null) { Runtime.trap("No data found for user.") };
      case (?_) { () };
    };

    let newEntry : WeightEntry = {
      timestamp = Time.now();
      weight;
    };

    let entriesList = switch (weightEntries.get(userId)) {
      case (?entries) { entries };
      case (null) { List.empty<WeightEntry>() };
    };

    entriesList.add(newEntry);
    weightEntries.add(userId, entriesList);
  };

  public shared ({ caller }) func addReminder(userId : Nat, time : Nat, daysOfWeek : [Bool], sound : Bool, vibration : Bool, alertType : Text) : async Nat {
    let currentSettings = switch (settings.get(userId)) {
      case (null) { Runtime.trap("No settings found for user.") };
      case (?data) { data };
    };

    if (not currentSettings.hasDailyGoal) {
      Runtime.trap("Please set a daily goal first.");
    };

    let reminderId = currentSettings.nextReminderId;
    let newReminder : Reminder = {
      id = reminderId;
      time;
      daysOfWeek;
      enabled = true;
      sound;
      vibration;
      alertType;
    };

    let remindersMap = switch (reminders.get(userId)) {
      case (?reminders) { reminders };
      case (null) { Map.empty<Nat, Reminder>() };
    };

    remindersMap.add(reminderId, newReminder);
    reminders.add(userId, remindersMap);

    let newSettings = {
      currentSettings with
      nextReminderId = reminderId + 1;
    };
    settings.add(userId, newSettings);
    reminderId;
  };

  public shared ({ caller }) func updateReminder(userId : Nat, reminderId : Nat, time : Nat, daysOfWeek : [Bool], sound : Bool, vibration : Bool, alertType : Text) : async () {
    let remindersMap = switch (reminders.get(userId)) {
      case (?reminders) { reminders };
      case (null) { Runtime.trap("No reminders found for user.") };
    };

    let existingReminder = switch (remindersMap.get(reminderId)) {
      case (null) { Runtime.trap("Reminder not found.") };
      case (?reminder) { reminder };
    };

    let updatedReminder = {
      existingReminder with
      time;
      daysOfWeek;
      sound;
      vibration;
      alertType;
    };

    remindersMap.add(reminderId, updatedReminder);
  };

  public shared ({ caller }) func toggleReminder(userId : Nat, reminderId : Nat, enabled : Bool) : async () {
    let remindersMap = switch (reminders.get(userId)) {
      case (?reminders) { reminders };
      case (null) { Runtime.trap("No reminders found for user.") };
    };

    let existingReminder = switch (remindersMap.get(reminderId)) {
      case (null) { Runtime.trap("Reminder not found.") };
      case (?reminder) { reminder };
    };

    let updatedReminder = {
      existingReminder with
      enabled;
    };

    remindersMap.add(reminderId, updatedReminder);
  };

  public shared ({ caller }) func setNightMode(userId : Nat, enabled : Bool, startTime : Nat, endTime : Nat, muteReminders : Bool) : async () {
    let currentSettings = switch (settings.get(userId)) {
      case (null) { Runtime.trap("No settings found for user.") };
      case (?_) { () };
    };

    let newNightMode = {
      enabled;
      startTime;
      endTime;
      muteReminders;
    };

    nightModes.add(userId, newNightMode);
  };

  public shared ({ caller }) func setAdvancedSettings(
    userId : Nat,
    reminderSound : Text,
    reminderMode : Text,
    missedReminderAlerts : Bool,
    units : Text,
    themeMode : Text,
    language : Text,
    wakeUpTime : ?Nat,
    sleepTime : ?Nat,
  ) : async () {
    let currentSettings = switch (settings.get(userId)) {
      case (null) { Runtime.trap("No settings found for user.") };
      case (?data) { data };
    };

    let newSettings = {
      currentSettings with
      reminderSound;
      reminderMode;
      missedReminderAlerts;
      units;
      themeMode;
      language;
      wakeUpTime;
      sleepTime;
    };
    settings.add(userId, newSettings);
  };

  public query ({ caller }) func getProgress(userId : Nat) : async WaterDataView {
    let currentSettings = switch (settings.get(userId)) {
      case (null) { Runtime.trap("No settings found for user.") };
      case (?data) { data };
    };

    if (not currentSettings.hasDailyGoal) {
      Runtime.trap("Please set a daily goal first.");
    };

    let entriesList = switch (waterEntries.get(userId)) {
      case (?entries) { entries };
      case (null) { List.empty<WaterEntry>() };
    };

    let weightList = switch (weightEntries.get(userId)) {
      case (?entries) { entries };
      case (null) { List.empty<WeightEntry>() };
    };

    let remindersMap = switch (reminders.get(userId)) {
      case (?reminders) { reminders };
      case (null) { Map.empty<Nat, Reminder>() };
    };

    let remindersList = List.empty<Reminder>();
    for (reminder in remindersMap.values()) {
      remindersList.add(reminder);
    };

    let nightMode = switch (nightModes.get(userId)) {
      case (?mode) { mode };
      case (null) {
        {
          enabled = false;
          startTime = 22 * 60;
          endTime = 6 * 60;
          muteReminders = true;
        };
      };
    };

    {
      dailyGoal = currentSettings.dailyGoal;
      currentCount = null;
      entries = entriesList.toArray();
      weightHistory = weightList.toArray();
      reminders = remindersList.toArray();
      nightMode;
      reminderSound = currentSettings.reminderSound;
      themeMode = currentSettings.themeMode;
      reminderMode = currentSettings.reminderMode;
      missedReminderAlerts = currentSettings.missedReminderAlerts;
      units = currentSettings.units;
      language = currentSettings.language;
      wakeUpTime = currentSettings.wakeUpTime;
      sleepTime = currentSettings.sleepTime;
    };
  };

  public query ({ caller }) func getDrinkLog(userId : Nat) : async [WaterEntry] {
    switch (waterEntries.get(userId)) {
      case (null) { [] };
      case (?entries) { entries.toArray() };
    };
  };

  public query ({ caller }) func getWeightHistory(userId : Nat) : async [WeightEntry] {
    switch (weightEntries.get(userId)) {
      case (null) { [] };
      case (?entries) { entries.toArray() };
    };
  };

  public query ({ caller }) func getDailySummary(userId : Nat) : async { total : Nat; goal : Nat } {
    let currentSettings = switch (settings.get(userId)) {
      case (null) { Runtime.trap("No settings found for user.") };
      case (?data) { data };
    };

    if (not currentSettings.hasDailyGoal) {
      Runtime.trap("Please set a daily goal first.");
    };

    { total = 0; goal = currentSettings.dailyGoal };
  };

  public query ({ caller }) func getWeeklySummary(userId : Nat) : async Nat {
    let currentSettings = switch (settings.get(userId)) {
      case (null) { Runtime.trap("No settings found for user.") };
      case (?data) { data };
    };

    if (not currentSettings.hasDailyGoal) {
      Runtime.trap("Please set a daily goal first.");
    };

    let entriesList = switch (waterEntries.get(userId)) {
      case (?entries) { entries };
      case (null) { List.empty<WaterEntry>() };
    };

    let now = Time.now();
    let weekInNanos = 7 * 24 * 60 * 60 * 1_000_000_000;

    var total = 0;

    for (entry in entriesList.values()) {
      if (now - entry.timestamp <= weekInNanos) {
        total += entry.amount;
      };
    };

    total;
  };

  public query ({ caller }) func getMonthlySummary(userId : Nat) : async Nat {
    let currentSettings = switch (settings.get(userId)) {
      case (null) { Runtime.trap("No settings found for user.") };
      case (?data) { data };
    };

    if (not currentSettings.hasDailyGoal) {
      Runtime.trap("Please set a daily goal first.");
    };

    let entriesList = switch (waterEntries.get(userId)) {
      case (?entries) { entries };
      case (null) { List.empty<WaterEntry>() };
    };

    let now = Time.now();
    let monthInNanos = 30 * 24 * 60 * 60 * 1_000_000_000;

    var total = 0;

    for (entry in entriesList.values()) {
      if (now - entry.timestamp <= monthInNanos) {
        total += entry.amount;
      };
    };

    total;
  };

  public query ({ caller }) func getReminders(userId : Nat) : async [Reminder] {
    let remindersMap = switch (reminders.get(userId)) {
      case (?reminders) { reminders };
      case (null) { Map.empty<Nat, Reminder>() };
    };

    let remindersList = List.empty<Reminder>();
    for (reminder in remindersMap.values()) {
      remindersList.add(reminder);
    };

    remindersList.toArray();
  };

  public query ({ caller }) func getNightMode(userId : Nat) : async NightMode {
    switch (nightModes.get(userId)) {
      case (null) {
        {
          enabled = false;
          startTime = 22 * 60;
          endTime = 6 * 60;
          muteReminders = true;
        };
      };
      case (?mode) { mode };
    };
  };

  public query ({ caller }) func getAdvancedSettings(userId : Nat) : async {
    reminderSound : Text;
    themeMode : Text;
    reminderMode : Text;
    missedReminderAlerts : Bool;
    units : Text;
    language : Text;
    wakeUpTime : ?Nat;
    sleepTime : ?Nat;
  } {
    let currentSettings = switch (settings.get(userId)) {
      case (null) { Runtime.trap("No settings found for user.") };
      case (?data) { data };
    };

    {
      reminderSound = currentSettings.reminderSound;
      themeMode = currentSettings.themeMode;
      reminderMode = currentSettings.reminderMode;
      missedReminderAlerts = currentSettings.missedReminderAlerts;
      units = currentSettings.units;
      language = currentSettings.language;
      wakeUpTime = currentSettings.wakeUpTime;
      sleepTime = currentSettings.sleepTime;
    };
  };
};
