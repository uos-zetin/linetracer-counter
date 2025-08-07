import { useState, useEffect } from "react";
import {
  Button,
  Badge,
  Card,
  Input,
  Textarea,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Alert,
  AlertTitle,
  AlertDescription,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/ui";
import type { Competition, CompetitionForm } from "@/entities/competition";
import type { Division, DivisionForm } from "@/entities/division";
import type { Record, RecordStatus } from "@/entities/record";
import {
  AdminCompetitionCreateModal,
  AdminCompetitionEditModal,
  AdminCompetitionDeleteModal,
  useCompetitionService,
} from "@/features/competition";
import {
  AdminDivisionCreateModal,
  AdminDivisionEditModal,
  AdminDivisionDeleteModal,
  useDivisionService,
} from "@/features/division";
import { useParticipantService } from "@/features/participant";
import { RecordListDisplay, RecordNoteEditor, RecordStatusSelector, useRecordService } from "@/features/record";

export const ComponentShowcasePage = () => {
  // Services
  const recordService = useRecordService();
  const competitionService = useCompetitionService();
  const divisionService = useDivisionService();
  const participantService = useParticipantService();

  // States
  const [selectedRecord, setSelectedRecord] = useState<Record | null>(null);
  const [currentNote, setCurrentNote] = useState("Sample note text for demonstration");
  const [currentStatus, setCurrentStatus] = useState<RecordStatus>("pending");
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCompetitionId, setSelectedCompetitionId] = useState<string>("");
  const [selectedDivisionId, setSelectedDivisionId] = useState<string>("");
  const [selectedParticipantId, setSelectedParticipantId] = useState<string>("");
  const [activeTab, setActiveTab] = useState<"shared" | "record" | "competition" | "division" | "data">("shared");

  // Modal states for Competition
  const [isCompetitionCreateModalOpen, setIsCompetitionCreateModalOpen] = useState(false);
  const [isCompetitionEditModalOpen, setIsCompetitionEditModalOpen] = useState(false);
  const [isCompetitionDeleteModalOpen, setIsCompetitionDeleteModalOpen] = useState(false);
  const [selectedCompetition, setSelectedCompetition] = useState<Competition | null>(null);

  // Modal states for Division
  const [isDivisionCreateModalOpen, setIsDivisionCreateModalOpen] = useState(false);
  const [isDivisionEditModalOpen, setIsDivisionEditModalOpen] = useState(false);
  const [isDivisionDeleteModalOpen, setIsDivisionDeleteModalOpen] = useState(false);
  const [selectedDivision, setSelectedDivision] = useState<Division | null>(null);

  // Data loading
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        await Promise.all([competitionService?.load.all(), recordService?.load.allRecords()]);
        setIsLoading(false);
      } catch (error) {
        console.error("Failed to load data:", error);
        setIsLoading(false);
      }
    };

    if (competitionService && recordService) {
      loadData();
    }
  }, [competitionService, recordService]);

  // Load divisions when competition changes
  useEffect(() => {
    if (selectedCompetitionId && divisionService) {
      divisionService.load.byCompetition(selectedCompetitionId);
    }
  }, [selectedCompetitionId, divisionService]);

  // Load participants when division changes
  useEffect(() => {
    if (selectedDivisionId && participantService) {
      participantService.loadParticipantsByDivisions([selectedDivisionId]);
    }
  }, [selectedDivisionId, participantService]);

  // Load records for selected participant
  useEffect(() => {
    if (selectedParticipantId && recordService) {
      recordService.load.byParticipant(selectedParticipantId);
    }
  }, [selectedParticipantId, recordService]);

  // Get data from services
  const competitions = competitionService?.use.competitions() || [];
  const divisions = divisionService?.use.divisionsByCompetition(selectedCompetitionId) || [];
  const participants = participantService?.useAllParticipants() || [];
  const records = recordService?.use.records() || [];

  const handleRecordSelect = (record: Record) => {
    setSelectedRecord(record);
    setCurrentNote(record.note);
    setCurrentStatus(record.status);
  };

  const handleNoteChange = (newNote: string) => {
    setCurrentNote(newNote);
    console.log("Note updated:", newNote);
  };

  const handleStatusChange = (newStatus: RecordStatus) => {
    setCurrentStatus(newStatus);
    console.log("Status updated:", newStatus);
  };

  // Competition handlers

  const handleCompetitionEdit = (competition: Competition) => {
    setSelectedCompetition(competition);
    setIsCompetitionEditModalOpen(true);
  };

  const handleCompetitionDelete = (competition: Competition) => {
    setSelectedCompetition(competition);
    setIsCompetitionDeleteModalOpen(true);
  };

  const handleCompetitionCreateSubmit = async (data: CompetitionForm) => {
    try {
      await competitionService?.admin.create(data);
      setIsCompetitionCreateModalOpen(false);
      console.log("Competition created:", data);
    } catch (error) {
      console.error("Failed to create competition:", error);
    }
  };

  const handleCompetitionEditSubmit = async (data: CompetitionForm) => {
    if (!selectedCompetition) return;
    try {
      await competitionService?.admin.update(selectedCompetition.id, data);
      setIsCompetitionEditModalOpen(false);
      setSelectedCompetition(null);
      console.log("Competition updated:", data);
    } catch (error) {
      console.error("Failed to update competition:", error);
    }
  };

  const handleCompetitionDeleteConfirm = async () => {
    if (!selectedCompetition) return;
    try {
      await competitionService?.admin.delete(selectedCompetition.id);
      setIsCompetitionDeleteModalOpen(false);
      setSelectedCompetition(null);
      console.log("Competition deleted:", selectedCompetition.id);
    } catch (error) {
      console.error("Failed to delete competition:", error);
    }
  };

  // Division handlers
  const handleDivisionCreate = () => {
    setIsDivisionCreateModalOpen(true);
  };

  const handleDivisionEdit = (division: Division) => {
    setSelectedDivision(division);
    setIsDivisionEditModalOpen(true);
  };

  const handleDivisionDelete = (division: Division) => {
    setSelectedDivision(division);
    setIsDivisionDeleteModalOpen(true);
  };

  const handleDivisionCreateSubmit = async (data: DivisionForm) => {
    try {
      await divisionService?.admin.create(data);
      setIsDivisionCreateModalOpen(false);
      console.log("Division created:", data);
    } catch (error) {
      console.error("Failed to create division:", error);
    }
  };

  const handleDivisionEditSubmit = async (data: DivisionForm) => {
    if (!selectedDivision) return;
    try {
      await divisionService?.admin.update(selectedDivision.id, data);
      setIsDivisionEditModalOpen(false);
      setSelectedDivision(null);
      console.log("Division updated:", data);
    } catch (error) {
      console.error("Failed to update division:", error);
    }
  };

  const handleDivisionDeleteConfirm = async () => {
    if (!selectedDivision) return;
    try {
      await divisionService?.admin.delete(selectedDivision.id);
      setIsDivisionDeleteModalOpen(false);
      setSelectedDivision(null);
      console.log("Division deleted:", selectedDivision.id);
    } catch (error) {
      console.error("Failed to delete division:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background p-6 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-2">Loading...</h1>
          <p className="text-muted-foreground">Fetching data from server...</p>
        </div>
      </div>
    );
  }

  const SharedComponentsTab = () => (
    <div className="space-y-6">
      {/* Buttons */}
      <Card className="p-6">
        <h3 className="text-xl font-semibold mb-4">Buttons</h3>
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <Button variant="default">Default</Button>
            <Button variant="destructive">Destructive</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="link">Link</Button>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button size="sm">Small</Button>
            <Button size="default">Default</Button>
            <Button size="lg">Large</Button>
            <Button size="icon">🔥</Button>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button disabled>Disabled</Button>
            <Button disabled>Loading</Button>
          </div>
        </div>
      </Card>

      {/* Badges */}
      <Card className="p-6">
        <h3 className="text-xl font-semibold mb-4">Badges</h3>
        <div className="flex flex-wrap gap-2">
          <Badge variant="default">Default</Badge>
          <Badge variant="secondary">Secondary</Badge>
          <Badge variant="destructive">Destructive</Badge>
          <Badge variant="outline">Outline</Badge>
        </div>
      </Card>

      {/* Form Inputs */}
      <Card className="p-6">
        <h3 className="text-xl font-semibold mb-4">Form Inputs</h3>
        <div className="space-y-4 max-w-md">
          <div>
            <label className="block text-sm font-medium mb-2">Input</label>
            <Input placeholder="Enter text here..." />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Textarea</label>
            <Textarea placeholder="Enter longer text here..." rows={3} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Select</label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Choose an option" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">Option 1</SelectItem>
                <SelectItem value="2">Option 2</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      {/* Alerts */}
      <Card className="p-6">
        <h3 className="text-xl font-semibold mb-4">Alerts</h3>
        <div className="space-y-4">
          <Alert>
            <AlertTitle>Default Alert</AlertTitle>
            <AlertDescription>This is a default alert message.</AlertDescription>
          </Alert>
          <Alert variant="destructive">
            <AlertTitle>Destructive Alert</AlertTitle>
            <AlertDescription>This is a destructive alert message.</AlertDescription>
          </Alert>
        </div>
      </Card>

      {/* Table */}
      <Card className="p-6">
        <h3 className="text-xl font-semibold mb-4">Table</h3>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Value</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell>John Doe</TableCell>
              <TableCell>
                <Badge variant="default">Active</Badge>
              </TableCell>
              <TableCell>1,234</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Jane Smith</TableCell>
              <TableCell>
                <Badge variant="secondary">Pending</Badge>
              </TableCell>
              <TableCell>5,678</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </Card>
    </div>
  );

  const RecordComponentsTab = () => (
    <div className="space-y-6">
      <Card className="p-6">
        <h3 className="text-xl font-semibold mb-4">Record Status Selector</h3>
        <div className="space-y-4">
          <RecordStatusSelector recordId="demo-1" currentStatus={currentStatus} onStatusChange={handleStatusChange} />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <RecordStatusSelector recordId="demo-approved" currentStatus="approved" />
            <RecordStatusSelector recordId="demo-pending" currentStatus="pending" />
            <RecordStatusSelector recordId="demo-rejected" currentStatus="rejected" />
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-xl font-semibold mb-4">Record Note Editor</h3>
        <RecordNoteEditor recordId="demo-note" currentNote={currentNote} onNoteChange={handleNoteChange} />
      </Card>

      <Card className="p-6">
        <h3 className="text-xl font-semibold mb-4">Record List Display</h3>
        <div className="space-y-4">
          {records.length > 0 ? (
            <>
              <div>
                <h4 className="font-medium mb-2">All Records</h4>
                <RecordListDisplay onRecordSelect={handleRecordSelect} showParticipantInfo={true} />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium mb-2">Approved Only</h4>
                  <RecordListDisplay filterByStatus="approved" onRecordSelect={handleRecordSelect} />
                </div>
                <div>
                  <h4 className="font-medium mb-2">Pending Only</h4>
                  <RecordListDisplay filterByStatus="pending" onRecordSelect={handleRecordSelect} />
                </div>
              </div>
            </>
          ) : (
            <Alert>
              <AlertTitle>No Records Available</AlertTitle>
              <AlertDescription>Select a participant from the Data tab to load records.</AlertDescription>
            </Alert>
          )}
        </div>
      </Card>
    </div>
  );

  const CompetitionComponentsTab = () => (
    <div className="space-y-6">
      <Card className="p-6">
        <h3 className="text-xl font-semibold mb-4">Competition Management</h3>
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <Button onClick={() => setIsCompetitionCreateModalOpen(true)}>Create Competition</Button>
          </div>

          {/* Competition List */}
          <div className="space-y-2">
            <h4 className="font-medium">Existing Competitions</h4>
            {competitions.length > 0 ? (
              <div className="space-y-2">
                {competitions.map((competition: Competition) => (
                  <div key={competition.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <h5 className="font-medium">{competition.name}</h5>
                      <p className="text-sm text-muted-foreground">{competition.description}</p>
                    </div>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm" onClick={() => handleCompetitionEdit(competition)}>
                        Edit
                      </Button>
                      <Button variant="destructive" size="sm" onClick={() => handleCompetitionDelete(competition)}>
                        Delete
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <Alert>
                <AlertTitle>No Competitions</AlertTitle>
                <AlertDescription>No competitions available. Create one to see it here.</AlertDescription>
              </Alert>
            )}
          </div>
        </div>
      </Card>
    </div>
  );

  const DivisionComponentsTab = () => (
    <div className="space-y-6">
      <Card className="p-6">
        <h3 className="text-xl font-semibold mb-4">Division Management</h3>
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <Button onClick={handleDivisionCreate} disabled={!selectedCompetitionId}>
              Create Division
            </Button>
          </div>

          {!selectedCompetitionId && (
            <Alert>
              <AlertTitle>Select Competition First</AlertTitle>
              <AlertDescription>
                Please select a competition from the Data tab to create and manage divisions.
              </AlertDescription>
            </Alert>
          )}

          {/* Division List */}
          {selectedCompetitionId && (
            <div className="space-y-2">
              <h4 className="font-medium">Divisions for Selected Competition</h4>
              {divisions.length > 0 ? (
                <div className="space-y-2">
                  {divisions.map((division: Division) => (
                    <div key={division.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <h5 className="font-medium">{division.name}</h5>
                        <p className="text-sm text-muted-foreground">{division.description}</p>
                        <Badge
                          variant={
                            division.status === "ongoing"
                              ? "default"
                              : division.status === "closed"
                                ? "destructive"
                                : "secondary"
                          }
                          className="capitalize"
                        >
                          {division.status}
                        </Badge>
                      </div>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm" onClick={() => handleDivisionEdit(division)}>
                          Edit
                        </Button>
                        <Button variant="destructive" size="sm" onClick={() => handleDivisionDelete(division)}>
                          Delete
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <Alert>
                  <AlertTitle>No Divisions</AlertTitle>
                  <AlertDescription>No divisions found for the selected competition.</AlertDescription>
                </Alert>
              )}
            </div>
          )}
        </div>
      </Card>
    </div>
  );

  const DataSelectionTab = () => (
    <div className="space-y-6">
      <Card className="p-6">
        <h3 className="text-xl font-semibold mb-4">Data Selection</h3>
        <p className="text-muted-foreground mb-4">
          Select competition, division, and participant to load relevant records
        </p>

        <div className="space-y-4 max-w-md">
          <div>
            <label className="block text-sm font-medium mb-2">Competition</label>
            <Select value={selectedCompetitionId} onValueChange={setSelectedCompetitionId}>
              <SelectTrigger>
                <SelectValue placeholder="Select Competition" />
              </SelectTrigger>
              <SelectContent>
                {competitions.map((comp) => (
                  <SelectItem key={comp.id} value={comp.id}>
                    {comp.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedCompetitionId && (
            <div>
              <label className="block text-sm font-medium mb-2">Division</label>
              <Select value={selectedDivisionId} onValueChange={setSelectedDivisionId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Division" />
                </SelectTrigger>
                <SelectContent>
                  {divisions.map((div: Division) => (
                    <SelectItem key={div.id} value={div.id}>
                      {div.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {selectedDivisionId && (
            <div>
              <label className="block text-sm font-medium mb-2">Participant</label>
              <Select value={selectedParticipantId} onValueChange={setSelectedParticipantId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Participant" />
                </SelectTrigger>
                <SelectContent>
                  {participants
                    .filter((p) => p.divisionId === selectedDivisionId)
                    .map((participant) => (
                      <SelectItem key={participant.id} value={participant.id}>
                        {participant.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
      </Card>

      {/* Data Summary */}
      <Card className="p-6">
        <h3 className="text-xl font-semibold mb-4">Current Data</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div className="p-4 bg-muted rounded-lg">
            <div className="text-2xl font-bold">{competitions.length}</div>
            <div className="text-sm text-muted-foreground">Competitions</div>
          </div>
          <div className="p-4 bg-muted rounded-lg">
            <div className="text-2xl font-bold">{divisions.length}</div>
            <div className="text-sm text-muted-foreground">Divisions</div>
          </div>
          <div className="p-4 bg-muted rounded-lg">
            <div className="text-2xl font-bold">{participants.length}</div>
            <div className="text-sm text-muted-foreground">Participants</div>
          </div>
          <div className="p-4 bg-muted rounded-lg">
            <div className="text-2xl font-bold">{records.length}</div>
            <div className="text-sm text-muted-foreground">Records</div>
          </div>
        </div>
      </Card>

      {/* Selected Record Info */}
      {selectedRecord && (
        <Card className="p-6">
          <h3 className="text-xl font-semibold mb-4">Selected Record</h3>
          <div className="space-y-2 text-sm">
            <div>
              <strong>ID:</strong> {selectedRecord.id}
            </div>
            <div>
              <strong>Participant:</strong> {selectedRecord.participantId}
            </div>
            <div>
              <strong>Value:</strong> {selectedRecord.value}ms
            </div>
            <div>
              <strong>Source:</strong> {selectedRecord.source}
            </div>
            <div>
              <strong>Status:</strong>{" "}
              <Badge
                variant={
                  selectedRecord.status === "approved"
                    ? "default"
                    : selectedRecord.status === "rejected"
                      ? "destructive"
                      : "secondary"
                }
              >
                {selectedRecord.status}
              </Badge>
            </div>
            <div>
              <strong>Note:</strong> {selectedRecord.note || "No note"}
            </div>
            <div>
              <strong>Created:</strong> {selectedRecord.createdAt.toLocaleString()}
            </div>
          </div>
        </Card>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">UI Components Showcase</h1>
          <p className="text-muted-foreground">
            Comprehensive demonstration of shared UI components and feature-specific components
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="mb-8">
          <div className="flex space-x-1 bg-muted p-1 rounded-lg w-fit">
            <Button
              variant={activeTab === "shared" ? "default" : "ghost"}
              size="sm"
              onClick={() => setActiveTab("shared")}
            >
              Shared Components
            </Button>
            <Button
              variant={activeTab === "record" ? "default" : "ghost"}
              size="sm"
              onClick={() => setActiveTab("record")}
            >
              Record Components
            </Button>
            <Button
              variant={activeTab === "competition" ? "default" : "ghost"}
              size="sm"
              onClick={() => setActiveTab("competition")}
            >
              Competition Components
            </Button>
            <Button
              variant={activeTab === "division" ? "default" : "ghost"}
              size="sm"
              onClick={() => setActiveTab("division")}
            >
              Division Components
            </Button>
            <Button variant={activeTab === "data" ? "default" : "ghost"} size="sm" onClick={() => setActiveTab("data")}>
              Data Selection
            </Button>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === "shared" && <SharedComponentsTab />}
        {activeTab === "record" && <RecordComponentsTab />}
        {activeTab === "competition" && <CompetitionComponentsTab />}
        {activeTab === "division" && <DivisionComponentsTab />}
        {activeTab === "data" && <DataSelectionTab />}
      </div>

      {/* Competition Modals */}
      <AdminCompetitionCreateModal
        isOpen={isCompetitionCreateModalOpen}
        onClose={() => setIsCompetitionCreateModalOpen(false)}
        onSubmit={handleCompetitionCreateSubmit}
      />

      <AdminCompetitionEditModal
        isOpen={isCompetitionEditModalOpen}
        onClose={() => {
          setIsCompetitionEditModalOpen(false);
          setSelectedCompetition(null);
        }}
        onSubmit={handleCompetitionEditSubmit}
        competition={selectedCompetition}
      />

      <AdminCompetitionDeleteModal
        isOpen={isCompetitionDeleteModalOpen}
        onClose={() => {
          setIsCompetitionDeleteModalOpen(false);
          setSelectedCompetition(null);
        }}
        onConfirm={handleCompetitionDeleteConfirm}
        competition={selectedCompetition}
      />

      {/* Division Modals */}
      <AdminDivisionCreateModal
        isOpen={isDivisionCreateModalOpen}
        onClose={() => setIsDivisionCreateModalOpen(false)}
        onSubmit={handleDivisionCreateSubmit}
        competitions={competitions}
        preSelectedCompetitionId={selectedCompetitionId}
      />

      <AdminDivisionEditModal
        isOpen={isDivisionEditModalOpen}
        onClose={() => {
          setIsDivisionEditModalOpen(false);
          setSelectedDivision(null);
        }}
        onSubmit={handleDivisionEditSubmit}
        division={selectedDivision}
        competitions={competitions}
      />

      <AdminDivisionDeleteModal
        isOpen={isDivisionDeleteModalOpen}
        onClose={() => {
          setIsDivisionDeleteModalOpen(false);
          setSelectedDivision(null);
        }}
        onConfirm={handleDivisionDeleteConfirm}
        division={selectedDivision}
      />
    </div>
  );
};
