import AppIntents
import Foundation
import SwiftUI
import WidgetKit

private enum DotItStore {
    static let group = "group.se.southnorth.dotdone"
    static let entriesFile = "dotdone_entries.json"
    static let tasksFile = "dotdone_widget_tasks.json"
    static let pendingDirectory = "dotdone_widget_pending"

    static func url(_ name: String) throws -> URL {
        guard let container = FileManager.default.containerURL(
            forSecurityApplicationGroupIdentifier: group
        ) else {
            throw StoreError.groupUnavailable
        }
        return container.appendingPathComponent(name)
    }

    static func tasks() -> [WidgetTask] {
        guard let file = try? url(tasksFile),
              let data = try? Data(contentsOf: file),
              let tasks = try? JSONDecoder().decode([WidgetTask].self, from: data) else {
            return []
        }
        return tasks.sorted { $0.order < $1.order }
    }

    static func hasDotToday(for taskID: String) -> Bool {
        guard let entries = try? allEntries() else { return false }
        return entries.contains { $0.taskId == taskID && $0.date == localDate(Date()) }
    }

    static func pendingEntries() throws -> [WidgetEntry] {
        let folder = try url(pendingDirectory)
        guard FileManager.default.fileExists(atPath: folder.path) else { return [] }
        return try FileManager.default.contentsOfDirectory(
            at: folder,
            includingPropertiesForKeys: nil
        )
        .filter { $0.pathExtension == "json" }
        .map { try JSONDecoder().decode(WidgetEntry.self, from: Data(contentsOf: $0)) }
    }

    static func allEntries() throws -> [WidgetEntry] {
        try readEntries() + pendingEntries()
    }

    static func readEntries() throws -> [WidgetEntry] {
        let file = try url(entriesFile)
        let backup = try url(entriesFile + ".backup")
        guard FileManager.default.fileExists(atPath: file.path) else {
            if FileManager.default.fileExists(atPath: backup.path) {
                return try JSONDecoder().decode([WidgetEntry].self, from: Data(contentsOf: backup))
            }
            return []
        }
        do {
            return try JSONDecoder().decode([WidgetEntry].self, from: Data(contentsOf: file))
        } catch {
            return try JSONDecoder().decode([WidgetEntry].self, from: Data(contentsOf: backup))
        }
    }

    static func record(taskID: String) throws {
        guard let task = tasks().first(where: { $0.id == taskID }) else {
            throw StoreError.taskMissing
        }
        let entries = try allEntries()
        let now = Date()
        // Match the app's five-second duplicate guard without opening an alert.
        let parser = ISO8601DateFormatter()
        parser.formatOptions = [.withInternetDateTime, .withFractionalSeconds]
        if let last = entries.last(where: { $0.taskId == taskID }),
           let lastDate = parser.date(from: last.timestamp),
           now.timeIntervalSince(lastDate) < 5 {
            return
        }
        let formatter = ISO8601DateFormatter()
        formatter.formatOptions = [.withInternetDateTime, .withFractionalSeconds]
        let entry = WidgetEntry(
            id: UUID().uuidString,
            date: localDate(now),
            timestamp: formatter.string(from: now),
            actionName: task.name,
            color: task.color,
            taskId: task.id
        )
        let folder = try url(pendingDirectory)
        try FileManager.default.createDirectory(at: folder, withIntermediateDirectories: true)
        let file = folder.appendingPathComponent(entry.id + ".json")
        try JSONEncoder().encode(entry).write(to: file, options: .atomic)
    }

    private static func localDate(_ date: Date) -> String {
        let formatter = DateFormatter()
        formatter.calendar = Calendar(identifier: .gregorian)
        formatter.locale = Locale(identifier: "en_US_POSIX")
        formatter.timeZone = .current
        formatter.dateFormat = "yyyy-MM-dd"
        return formatter.string(from: date)
    }

    enum StoreError: Error {
        case groupUnavailable
        case taskMissing
    }
}

private struct WidgetTask: Decodable {
    let id: String
    let name: String
    let color: String
    let order: Int
}

private struct WidgetEntry: Codable {
    let id: String
    let date: String
    let timestamp: String
    let actionName: String
    let color: String
    let taskId: String?
}

@available(iOS 17.0, *)
private struct DotTaskEntity: AppEntity {
    static var typeDisplayRepresentation = TypeDisplayRepresentation(name: "Task")
    static var defaultQuery = DotTaskQuery()

    let id: String
    let name: String
    let color: String

    var displayRepresentation: DisplayRepresentation {
        DisplayRepresentation(title: "\(name)")
    }
}

@available(iOS 17.0, *)
private struct DotTaskQuery: EntityQuery {
    func entities(for identifiers: [String]) async throws -> [DotTaskEntity] {
        DotItStore.tasks()
            .filter { identifiers.contains($0.id) }
            .map { DotTaskEntity(id: $0.id, name: $0.name, color: $0.color) }
    }

    func suggestedEntities() async throws -> [DotTaskEntity] {
        DotItStore.tasks().map {
            DotTaskEntity(id: $0.id, name: $0.name, color: $0.color)
        }
    }
}

@available(iOS 17.0, *)
private struct ChooseTaskIntent: WidgetConfigurationIntent {
    static var title: LocalizedStringResource = "Choose a task"
    static var description = IntentDescription("One widget records one task.")

    @Parameter(title: "Task")
    var task: DotTaskEntity?
}

@available(iOS 17.0, *)
private struct RecordDotIntent: AppIntent {
    static var title: LocalizedStringResource = "Record a dot"
    static var openAppWhenRun = false

    @Parameter(title: "Task ID")
    var taskID: String

    init() {}

    init(taskID: String) {
        self.taskID = taskID
    }

    func perform() async throws -> some IntentResult {
        try DotItStore.record(taskID: taskID)
        WidgetCenter.shared.reloadAllTimelines()
        return .result()
    }
}

@available(iOS 17.0, *)
private struct DotTimelineEntry: TimelineEntry {
    let date: Date
    let task: DotTaskEntity?
    let loggedToday: Bool
}

@available(iOS 17.0, *)
private struct DotProvider: AppIntentTimelineProvider {
    func placeholder(in context: Context) -> DotTimelineEntry {
        DotTimelineEntry(date: Date(), task: nil, loggedToday: false)
    }

    func snapshot(for configuration: ChooseTaskIntent, in context: Context) async -> DotTimelineEntry {
        entry(for: configuration)
    }

    func timeline(for configuration: ChooseTaskIntent, in context: Context) async -> Timeline<DotTimelineEntry> {
        let current = entry(for: configuration)
        let nextDay = Calendar.current.startOfDay(for: Date()).addingTimeInterval(86400)
        return Timeline(entries: [current], policy: .after(nextDay))
    }

    private func entry(for configuration: ChooseTaskIntent) -> DotTimelineEntry {
        let task = configuration.task
        return DotTimelineEntry(
            date: Date(),
            task: task,
            loggedToday: task.map { DotItStore.hasDotToday(for: $0.id) } ?? false
        )
    }
}

@available(iOS 17.0, *)
private struct InteractiveDotView: View {
    let entry: DotTimelineEntry

    var body: some View {
        VStack(spacing: 13) {
            if let task = entry.task {
                Button(intent: RecordDotIntent(taskID: task.id)) {
                    Circle()
                        .fill(Color(hex: task.color))
                        .frame(width: 62, height: 62)
                        .overlay {
                            if entry.loggedToday {
                                Image(systemName: "checkmark")
                                    .font(.system(size: 22, weight: .medium))
                                    .foregroundStyle(.white)
                            }
                        }
                }
                .buttonStyle(.plain)
                Text(task.name)
                    .font(.custom("NDOT47inspiredbyNOTHING", size: 12))
                    .lineLimit(1)
            } else {
                Circle().stroke(.black, lineWidth: 2).frame(width: 62, height: 62)
                Text("CHOOSE A TASK")
                    .font(.custom("NDOT47inspiredbyNOTHING", size: 11))
            }
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .containerBackground(.white, for: .widget)
    }
}

@available(iOS 17.0, *)
private struct InteractiveDotWidget: Widget {
    let kind = "DotItInteractiveDot"

    var body: some WidgetConfiguration {
        AppIntentConfiguration(kind: kind, intent: ChooseTaskIntent.self, provider: DotProvider()) {
            InteractiveDotView(entry: $0)
        }
        .configurationDisplayName("Dot It")
        .description("Tap once to record a dot for your chosen task.")
        .supportedFamilies([.systemSmall])
    }
}

private struct OpenAppEntry: TimelineEntry {
    let date: Date
}

private struct OpenAppProvider: TimelineProvider {
    func placeholder(in context: Context) -> OpenAppEntry { OpenAppEntry(date: Date()) }
    func getSnapshot(in context: Context, completion: @escaping (OpenAppEntry) -> Void) {
        completion(OpenAppEntry(date: Date()))
    }
    func getTimeline(in context: Context, completion: @escaping (Timeline<OpenAppEntry>) -> Void) {
        completion(Timeline(entries: [OpenAppEntry(date: Date())], policy: .never))
    }
}

private struct OpenAppWidget: Widget {
    var body: some WidgetConfiguration {
        StaticConfiguration(kind: "DotItOpenApp", provider: OpenAppProvider()) { _ in
            VStack(spacing: 13) {
                Circle().fill(.black).frame(width: 62, height: 62)
                Text("DOT IT")
                    .font(.custom("NDOT47inspiredbyNOTHING", size: 12))
            }
            .frame(maxWidth: .infinity, maxHeight: .infinity)
            .background(.white)
            .widgetURL(URL(string: "dotit://home"))
        }
        .configurationDisplayName("Open Dot It")
        .description("Open Dot It to record a dot.")
        .supportedFamilies([.systemSmall])
    }
}

private extension Color {
    init(hex: String) {
        let value = Int(hex.trimmingCharacters(in: CharacterSet(charactersIn: "#")), radix: 16) ?? 0
        self.init(
            red: Double((value >> 16) & 255) / 255,
            green: Double((value >> 8) & 255) / 255,
            blue: Double(value & 255) / 255
        )
    }
}

@main
struct DotItWidgetBundle: WidgetBundle {
    @WidgetBundleBuilder
    var body: some Widget {
        if #available(iOS 17.0, *) {
            InteractiveDotWidget()
        }
        OpenAppWidget()
    }
}
