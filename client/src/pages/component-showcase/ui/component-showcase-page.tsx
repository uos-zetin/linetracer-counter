import { useState, useEffect } from "react";
import {
  AuthenticationError,
  AuthorizationError,
  ServerError,
  ValidationError,
  NotFoundError,
  TimerLogConsecutiveError,
} from "@/shared/api/errors";
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
import type { Participant, ParticipantForm } from "@/entities/participant";
import type { Record, RecordStatus } from "@/entities/record";
import type { User, UserRegisterForm, UserRole } from "@/entities/user";
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
import { useErrorHandlingService } from "@/features/error-handling";
import {
  AdminParticipantCreateModal,
  AdminParticipantEditModal,
  AdminParticipantDeleteModal,
  useParticipantService,
} from "@/features/participant";
import { RecordListDisplay, RecordNoteEditor, RecordStatusSelector, useRecordService } from "@/features/record";
import { AdminUserCreateModal, AdminUserEditRolesModal, AdminUserDeleteModal, useUserService } from "@/features/user";
import { AppHeader } from "@/widgets/app-header";
import { DataTable } from "@/widgets/data-table";
import { LoadingSpinner } from "@/widgets/loading-spinner";
import { PageContainer } from "@/widgets/page-container";

export const ComponentShowcasePage = () => {
  // Services
  const recordService = useRecordService();
  const competitionService = useCompetitionService();
  const divisionService = useDivisionService();
  const participantService = useParticipantService();
  const userService = useUserService();

  // States
  const [selectedRecord, setSelectedRecord] = useState<Record | null>(null);
  const [currentNote, setCurrentNote] = useState("Sample note text for demonstration");
  const [currentStatus, setCurrentStatus] = useState<RecordStatus>("pending");
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCompetitionId, setSelectedCompetitionId] = useState<string>("");
  const [selectedDivisionId, setSelectedDivisionId] = useState<string>("");
  const [selectedParticipantId, setSelectedParticipantId] = useState<string>("");
  const [activeTab, setActiveTab] = useState<
    "shared" | "widgets" | "record" | "competition" | "division" | "participant" | "user" | "error-handling" | "data"
  >("shared");

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

  // Modal states for Participant
  const [isParticipantCreateModalOpen, setIsParticipantCreateModalOpen] = useState(false);
  const [isParticipantEditModalOpen, setIsParticipantEditModalOpen] = useState(false);
  const [isParticipantDeleteModalOpen, setIsParticipantDeleteModalOpen] = useState(false);
  const [selectedParticipant, setSelectedParticipant] = useState<Participant | null>(null);

  // Modal states for User
  const [isUserCreateModalOpen, setIsUserCreateModalOpen] = useState(false);
  const [isUserEditRolesModalOpen, setIsUserEditRolesModalOpen] = useState(false);
  const [isUserDeleteModalOpen, setIsUserDeleteModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // Widget 테스트 상태
  const [widgetTitle, setWidgetTitle] = useState("위젯 테스트 페이지");
  const [showBackButton, setShowBackButton] = useState(true);
  const [showLogout, setShowLogout] = useState(true);

  // Data loading
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        await Promise.all([competitionService?.load.all(), recordService?.load.allRecords(), userService?.load.all()]);
        setIsLoading(false);
      } catch (error) {
        console.error("Failed to load data:", error);
        setIsLoading(false);
      }
    };

    if (competitionService && recordService && userService) {
      loadData();
    }
  }, [competitionService, recordService, userService]);

  // Load divisions when competition changes
  useEffect(() => {
    if (selectedCompetitionId && divisionService) {
      divisionService.load.byCompetition(selectedCompetitionId);
    }
  }, [selectedCompetitionId, divisionService]);

  // Load participants when division changes
  useEffect(() => {
    if (selectedDivisionId && participantService) {
      participantService.load.byDivisions([selectedDivisionId]);
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
  const participants = participantService?.use.allParticipants() || [];
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

  // Participant handlers
  const handleParticipantCreate = () => {
    setIsParticipantCreateModalOpen(true);
  };

  const handleParticipantEdit = (participant: Participant) => {
    setSelectedParticipant(participant);
    setIsParticipantEditModalOpen(true);
  };

  const handleParticipantDelete = (participant: Participant) => {
    setSelectedParticipant(participant);
    setIsParticipantDeleteModalOpen(true);
  };

  const handleParticipantCreateSubmit = async (data: ParticipantForm) => {
    try {
      await participantService?.admin.create(data.divisionId, data);
      setIsParticipantCreateModalOpen(false);
      console.log("Participant created:", data);
    } catch (error) {
      console.error("Failed to create participant:", error);
    }
  };

  const handleParticipantEditSubmit = async (data: ParticipantForm) => {
    if (!selectedParticipant) return;
    try {
      await participantService?.admin.update(selectedParticipant.id, data);
      setIsParticipantEditModalOpen(false);
      setSelectedParticipant(null);
      console.log("Participant updated:", data);
    } catch (error) {
      console.error("Failed to update participant:", error);
    }
  };

  const handleParticipantDeleteConfirm = async () => {
    if (!selectedParticipant) return;
    try {
      await participantService?.admin.delete(selectedParticipant.id);
      setIsParticipantDeleteModalOpen(false);
      setSelectedParticipant(null);
      console.log("Participant deleted:", selectedParticipant.id);
    } catch (error) {
      console.error("Failed to delete participant:", error);
    }
  };

  // User handlers
  const handleUserCreate = () => {
    setIsUserCreateModalOpen(true);
  };

  const handleUserEditRoles = (user: User) => {
    setSelectedUser(user);
    setIsUserEditRolesModalOpen(true);
  };

  const handleUserDelete = (user: User) => {
    setSelectedUser(user);
    setIsUserDeleteModalOpen(true);
  };

  const handleUserCreateSubmit = async (data: UserRegisterForm) => {
    try {
      await userService?.admin.create(data);
      setIsUserCreateModalOpen(false);
      console.log("User created:", data);
    } catch (error) {
      console.error("Failed to create user:", error);
    }
  };

  const handleUserEditRolesSubmit = async (roles: UserRole[]) => {
    if (!selectedUser) return;
    try {
      await userService?.admin.updateRoles(selectedUser.id, roles);
      setIsUserEditRolesModalOpen(false);
      setSelectedUser(null);
      console.log("User roles updated:", selectedUser.id, roles);
    } catch (error) {
      console.error("Failed to update user roles:", error);
    }
  };

  const handleUserDeleteConfirm = async () => {
    if (!selectedUser) return;
    try {
      await userService?.admin.delete(selectedUser.id);
      setIsUserDeleteModalOpen(false);
      setSelectedUser(null);
      console.log("User deleted:", selectedUser.id);
    } catch (error) {
      console.error("Failed to delete user:", error);
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

  const ParticipantComponentsTab = () => (
    <div className="space-y-6">
      <Card className="p-6">
        <h3 className="text-xl font-semibold mb-4">Participant Management</h3>
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <Button onClick={handleParticipantCreate} disabled={!selectedDivisionId}>
              Create Participant
            </Button>
          </div>

          {!selectedDivisionId && (
            <Alert>
              <AlertTitle>Select Division First</AlertTitle>
              <AlertDescription>
                Please select a division from the Data tab to create and manage participants.
              </AlertDescription>
            </Alert>
          )}

          {/* Participant List */}
          {selectedDivisionId && (
            <div className="space-y-2">
              <h4 className="font-medium">Participants for Selected Division</h4>
              {participants.filter((p) => p.divisionId === selectedDivisionId).length > 0 ? (
                <div className="space-y-2">
                  {participants
                    .filter((p: Participant) => p.divisionId === selectedDivisionId)
                    .sort((a: Participant, b: Participant) => a.orderRaw - b.orderRaw)
                    .map((participant: Participant) => (
                      <div key={participant.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <h5 className="font-medium">{participant.name}</h5>
                          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                            <span>Order: {participant.orderRaw}</span>
                            {participant.teamName && (
                              <>
                                <span>•</span>
                                <span>{participant.teamName}</span>
                              </>
                            )}
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm" onClick={() => handleParticipantEdit(participant)}>
                            Edit
                          </Button>
                          <Button variant="destructive" size="sm" onClick={() => handleParticipantDelete(participant)}>
                            Delete
                          </Button>
                        </div>
                      </div>
                    ))}
                </div>
              ) : (
                <Alert>
                  <AlertTitle>No Participants</AlertTitle>
                  <AlertDescription>No participants found for the selected division.</AlertDescription>
                </Alert>
              )}
            </div>
          )}
        </div>
      </Card>
    </div>
  );

  const UserComponentsTab = () => {
    const users = userService?.use.users() || [];

    return (
      <div className="space-y-6">
        <Card className="p-6">
          <h3 className="text-xl font-semibold mb-4">User Management</h3>
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <Button onClick={handleUserCreate}>Create User</Button>
            </div>

            {/* User List */}
            <div className="space-y-2">
              <h4 className="font-medium">Users</h4>
              {users.length > 0 ? (
                <div className="space-y-2">
                  {users.map((user: User) => (
                    <div key={user.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <h5 className="font-medium">{user.name}</h5>
                        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                          <span>ID: {user.id}</span>
                          <span>•</span>
                          <span>Roles: {user.roles.length > 0 ? user.roles.join(", ") : "None"}</span>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm" onClick={() => handleUserEditRoles(user)}>
                          Edit Roles
                        </Button>
                        <Button variant="destructive" size="sm" onClick={() => handleUserDelete(user)}>
                          Delete
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <Alert>
                  <AlertTitle>No Users</AlertTitle>
                  <AlertDescription>No users found. Create a user to get started.</AlertDescription>
                </Alert>
              )}
            </div>
          </div>
        </Card>
      </div>
    );
  };

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

  const WidgetComponentsTab = () => (
    <div className="space-y-6">
      {/* PageContainer Widget */}
      <Card className="p-6">
        <h3 className="text-xl font-semibold mb-4">PageContainer Widget</h3>
        <p className="text-sm text-muted-foreground mb-4">
          모든 페이지에서 공통으로 사용되는 표준화된 컨테이너입니다. 반응형 여백과 최대 너비를 제공합니다.
        </p>

        <div className="space-y-6">
          {/* 최대 너비 비교를 위해 전체 화면 너비에서 테스트 */}
          <div
            className="bg-gray-100 p-4 rounded-lg relative"
            style={{
              marginLeft: "calc(-50vw + 50%)",
              marginRight: "calc(-50vw + 50%)",
              width: "100vw",
            }}
          >
            <h4 className="font-medium mb-4 px-6">최대 너비 비교 (전체 화면 기준)</h4>

            <div className="space-y-4">
              <div>
                <div className="text-sm text-gray-600 px-6 mb-2">작은 컨테이너 (max-w-screen-sm = 640px)</div>
                <PageContainer
                  maxWidth="sm"
                  className="bg-red-100 border-2 border-red-300 rounded min-h-12 flex items-center justify-center"
                >
                  <span className="text-red-700 font-medium">max-w-screen-sm (640px)</span>
                </PageContainer>
              </div>

              <div>
                <div className="text-sm text-gray-600 px-6 mb-2">중간 컨테이너 (max-w-screen-md = 768px)</div>
                <PageContainer
                  maxWidth="md"
                  className="bg-yellow-100 border-2 border-yellow-300 rounded min-h-12 flex items-center justify-center"
                >
                  <span className="text-yellow-700 font-medium">max-w-screen-md (768px)</span>
                </PageContainer>
              </div>

              <div>
                <div className="text-sm text-gray-600 px-6 mb-2">큰 컨테이너 (max-w-screen-lg = 1024px)</div>
                <PageContainer
                  maxWidth="lg"
                  className="bg-green-100 border-2 border-green-300 rounded min-h-12 flex items-center justify-center"
                >
                  <span className="text-green-700 font-medium">max-w-screen-lg (1024px)</span>
                </PageContainer>
              </div>

              <div>
                <div className="text-sm text-gray-600 px-6 mb-2">매우 큰 컨테이너 (max-w-screen-xl = 1280px)</div>
                <PageContainer
                  maxWidth="xl"
                  className="bg-blue-100 border-2 border-blue-300 rounded min-h-12 flex items-center justify-center"
                >
                  <span className="text-blue-700 font-medium">max-w-screen-xl (1280px)</span>
                </PageContainer>
              </div>

              <div>
                <div className="text-sm text-gray-600 px-6 mb-2">최대 컨테이너 (max-w-screen-2xl = 1536px)</div>
                <PageContainer
                  maxWidth="2xl"
                  className="bg-indigo-100 border-2 border-indigo-300 rounded min-h-12 flex items-center justify-center"
                >
                  <span className="text-indigo-700 font-medium">max-w-screen-2xl (1536px)</span>
                </PageContainer>
              </div>

              <div>
                <div className="text-sm text-gray-600 px-6 mb-2">기본 컨테이너 (max-w-7xl = 1280px) - 기본값</div>
                <PageContainer
                  maxWidth="7xl"
                  className="bg-violet-100 border-2 border-violet-300 rounded min-h-12 flex items-center justify-center"
                >
                  <span className="text-violet-700 font-medium">max-w-7xl (1280px) - 기본값</span>
                </PageContainer>
              </div>

              <div>
                <div className="text-sm text-gray-600 px-6 mb-2">전체 너비 컨테이너 (max-w-full = 제한 없음)</div>
                <PageContainer
                  maxWidth="full"
                  className="bg-purple-100 border-2 border-purple-300 rounded min-h-12 flex items-center justify-center"
                >
                  <span className="text-purple-700 font-medium">max-w-full (제한 없음)</span>
                </PageContainer>
              </div>
            </div>
          </div>

          {/* 패딩 차이 비교 - 외부 컨테이너 내에서 내부 여백 확인 */}
          <div className="space-y-4">
            <h4 className="font-medium">패딩 차이 비교</h4>
            <p className="text-sm text-gray-600 mb-4">
              각 패딩 옵션이 컨테이너 내부 콘텐츠에 어떤 여백을 주는지 확인할 수 있습니다.
              <strong>회색 테두리가 실제 컨테이너 경계</strong>이고, 그 안의{" "}
              <strong>색깔 영역이 콘텐츠가 들어갈 공간</strong>입니다.
            </p>

            <div className="space-y-4">
              <div className="bg-gray-200 p-2 rounded-lg">
                <div className="text-sm text-gray-700 mb-2 px-2">
                  패딩 없음 (padding: none) - 컨테이너 경계까지 콘텐츠
                </div>
                <PageContainer maxWidth="lg" padding="none" className="bg-red-100 border-2 border-red-400 min-h-16">
                  <div className="bg-red-300 p-2 text-red-800 text-center">패딩 없음 - 컨테이너 끝까지 콘텐츠</div>
                </PageContainer>
              </div>

              <div className="bg-gray-200 p-2 rounded-lg">
                <div className="text-sm text-gray-700 mb-2 px-2">작은 패딩 (padding: sm = px-2 sm:px-4)</div>
                <PageContainer maxWidth="lg" padding="sm" className="bg-green-100 border-2 border-green-400 min-h-16">
                  <div className="bg-green-300 p-2 text-green-800 text-center">작은 패딩 - 좌우로 조금의 여백</div>
                </PageContainer>
              </div>

              <div className="bg-gray-200 p-2 rounded-lg">
                <div className="text-sm text-gray-700 mb-2 px-2">
                  중간 패딩 (padding: md = px-4 sm:px-6 lg:px-8) - 기본값
                </div>
                <PageContainer maxWidth="lg" padding="md" className="bg-blue-100 border-2 border-blue-400 min-h-16">
                  <div className="bg-blue-300 p-2 text-blue-800 text-center">
                    중간 패딩 (기본) - 적당한 여백으로 균형감 있음
                  </div>
                </PageContainer>
              </div>

              <div className="bg-gray-200 p-2 rounded-lg">
                <div className="text-sm text-gray-700 mb-2 px-2">큰 패딩 (padding: lg = px-6 sm:px-8 lg:px-12)</div>
                <PageContainer maxWidth="lg" padding="lg" className="bg-purple-100 border-2 border-purple-400 min-h-16">
                  <div className="bg-purple-300 p-2 text-purple-800 text-center">
                    큰 패딩 - 좌우로 넓은 여백으로 여유로운 느낌
                  </div>
                </PageContainer>
              </div>
            </div>

            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <h5 className="font-medium text-yellow-800 mb-2">패딩 반응형 동작</h5>
              <ul className="text-sm text-yellow-700 space-y-1">
                <li>
                  • <strong>sm 패딩</strong>: 모바일 px-2 → 태블릿+ px-4
                </li>
                <li>
                  • <strong>md 패딩 (기본)</strong>: 모바일 px-4 → 태블릿 px-6 → 데스크톱 px-8
                </li>
                <li>
                  • <strong>lg 패딩</strong>: 모바일 px-6 → 태블릿 px-8 → 데스크톱 px-12
                </li>
              </ul>
            </div>
          </div>
        </div>
      </Card>

      {/* LoadingSpinner Widget */}
      <Card className="p-6">
        <h3 className="text-xl font-semibold mb-4">LoadingSpinner Widget</h3>
        <p className="text-sm text-muted-foreground mb-4">
          공통 로딩 상태를 표시하는 스피너 컴포넌트입니다. 다양한 크기와 메시지를 지원합니다.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h4 className="font-medium">크기별 스피너</h4>
            <div className="flex items-end space-x-6 p-4 border rounded-lg">
              <div className="text-center">
                <LoadingSpinner size="sm" message="Small" />
              </div>
              <div className="text-center">
                <LoadingSpinner size="md" message="Medium" />
              </div>
              <div className="text-center">
                <LoadingSpinner size="lg" message="Large" />
              </div>
              <div className="text-center">
                <LoadingSpinner size="xl" message="Extra Large" />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="font-medium">메시지 옵션</h4>
            <div className="space-y-4">
              <div className="p-4 border rounded-lg">
                <LoadingSpinner message="데이터 로딩 중..." />
              </div>
              <div className="p-4 border rounded-lg">
                <LoadingSpinner message="" />
              </div>
              <div className="p-4 border rounded-lg">
                <LoadingSpinner size="lg" message="처리 중입니다..." />
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* DataTable Widget */}
      <Card className="p-6">
        <h3 className="text-xl font-semibold mb-4">DataTable Widget</h3>
        <p className="text-sm text-muted-foreground mb-4">
          반응형 테이블 위젯입니다. 데스크톱에서는 테이블, 모바일에서는 카드 형태로 표시됩니다.
        </p>

        {/* 샘플 데이터로 테이블 테스트 */}
        <DataTable
          data={[
            {
              id: 1,
              name: "홍길동",
              email: "hong@example.com",
              role: "admin",
              status: "active",
              createdAt: "2024-01-15",
            },
            {
              id: 2,
              name: "김철수",
              email: "kim@example.com",
              role: "user",
              status: "inactive",
              createdAt: "2024-01-10",
            },
            {
              id: 3,
              name: "이영희",
              email: "lee@example.com",
              role: "user",
              status: "active",
              createdAt: "2024-01-05",
            },
            {
              id: 4,
              name: "박민수",
              email: "park@example.com",
              role: "moderator",
              status: "active",
              createdAt: "2024-01-01",
            },
            {
              id: 5,
              name: "정수진",
              email: "jung@example.com",
              role: "user",
              status: "pending",
              createdAt: "2023-12-28",
            },
          ]}
          columns={[
            { key: "name", label: "이름", sortable: true, width: "120px" },
            { key: "email", label: "이메일", sortable: true, width: "200px" },
            {
              key: "role",
              label: "역할",
              sortable: true,
              width: "100px",
              render: (_, value) => (
                <Badge variant={value === "admin" ? "default" : value === "moderator" ? "secondary" : "outline"}>
                  {String(value)}
                </Badge>
              ),
            },
            {
              key: "status",
              label: "상태",
              sortable: true,
              width: "100px",
              render: (_, value) => (
                <Badge variant={value === "active" ? "default" : value === "inactive" ? "destructive" : "secondary"}>
                  {String(value)}
                </Badge>
              ),
            },
            { key: "createdAt", label: "생성일", sortable: true, width: "120px" },
          ]}
          onRowClick={(item) => console.log("Clicked:", item)}
          pageSize={3}
          fixedLayout={true}
        />

        <div className="mt-4 p-4 bg-muted rounded-lg">
          <h4 className="font-medium mb-2">기능</h4>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• 컬럼 정렬 (클릭하여 정렬)</li>
            <li>• 페이지네이션 (3개씩 표시)</li>
            <li>• 반응형 디자인 (모바일에서 카드 뷰)</li>
            <li>• 행 클릭 이벤트 (콘솔 확인)</li>
            <li>• 커스텀 렌더링 (Badge 컴포넌트 사용)</li>
            <li>• 고정 컬럼 너비 (fixedLayout: true)</li>
          </ul>
        </div>
      </Card>

      {/* AppHeader Widget */}
      <Card className="p-6">
        <h3 className="text-xl font-semibold mb-4">AppHeader Widget</h3>
        <p className="text-sm text-muted-foreground mb-4">
          여러 페이지에서 공통으로 사용되는 헤더 컴포넌트입니다. 현재 Admin, Home 페이지에서 사용 중이며, 향후 Counter
          Selector, Controller, Manual Counter 페이지에도 적용 예정입니다.
        </p>

        {/* 설정 컨트롤 */}
        <div className="space-y-4 mb-6 p-4 bg-muted rounded-lg">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium">제목</label>
              <Input
                value={widgetTitle}
                onChange={(e) => setWidgetTitle(e.target.value)}
                placeholder="헤더 제목 입력"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium">뒤로가기 버튼</label>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={showBackButton}
                  onChange={(e) => setShowBackButton(e.target.checked)}
                  className="rounded"
                />
                <span className="text-sm">표시</span>
              </div>
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium">로그아웃 버튼</label>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={showLogout}
                  onChange={(e) => setShowLogout(e.target.checked)}
                  className="rounded"
                />
                <span className="text-sm">표시</span>
              </div>
            </div>
          </div>
        </div>

        {/* AppHeader 미리보기 */}
        <div className="border rounded-lg overflow-hidden">
          <AppHeader
            title={widgetTitle}
            showBackButton={showBackButton}
            backPath="/component-showcase"
            showLogout={showLogout}
          />
          <div className="p-4 bg-gray-50 text-sm text-gray-600">
            <p>← 실제 헤더 컴포넌트입니다 (Interactive)</p>
          </div>
        </div>

        {/* 사용 예시 */}
        <div className="mt-6">
          <h4 className="font-medium mb-2">사용 예시</h4>
          <div className="bg-gray-100 p-4 rounded-lg overflow-x-auto">
            <pre className="text-sm whitespace-pre-wrap">
              {`// 기본 사용법
<AppHeader title="페이지 제목" />

// 모든 옵션 포함
<AppHeader 
  title="관리자 페이지"
  showBackButton={true}
  backPath="/"
  showLogout={true}
/>`}
            </pre>
          </div>
        </div>

        {/* 반응형 테스트 */}
        <div className="mt-6">
          <h4 className="font-medium mb-2">반응형 동작 테스트</h4>
          <div className="text-sm text-gray-600 space-y-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div>• 화면 크기를 조절하여 반응형 동작 확인</div>
              <div>• 모바일: 사용자 인사말 숨겨짐</div>
              <div>• 터치: 최소 44px 터치 영역 보장</div>
              <div>• Tailwind 표준 반응형 클래스 사용</div>
            </div>
            <Alert className="mt-4">
              <AlertDescription>
                <strong>테스트 방법:</strong> 브라우저 개발자 도구를 열고 모바일 화면 모드로 전환하여 다양한 화면
                크기에서 헤더의 반응형 동작을 확인해보세요.
              </AlertDescription>
            </Alert>
          </div>
        </div>
      </Card>
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
          <div className="bg-muted p-1 rounded-lg overflow-x-auto">
            <div className="flex space-x-1 min-w-max">
              <Button
                variant={activeTab === "shared" ? "default" : "ghost"}
                size="sm"
                onClick={() => setActiveTab("shared")}
                className="whitespace-nowrap"
              >
                Shared
              </Button>
              <Button
                variant={activeTab === "widgets" ? "default" : "ghost"}
                size="sm"
                onClick={() => setActiveTab("widgets")}
                className="whitespace-nowrap"
              >
                Widgets
              </Button>
              <Button
                variant={activeTab === "record" ? "default" : "ghost"}
                size="sm"
                onClick={() => setActiveTab("record")}
                className="whitespace-nowrap"
              >
                Record
              </Button>
              <Button
                variant={activeTab === "competition" ? "default" : "ghost"}
                size="sm"
                onClick={() => setActiveTab("competition")}
                className="whitespace-nowrap"
              >
                Competition
              </Button>
              <Button
                variant={activeTab === "division" ? "default" : "ghost"}
                size="sm"
                onClick={() => setActiveTab("division")}
                className="whitespace-nowrap"
              >
                Division
              </Button>
              <Button
                variant={activeTab === "participant" ? "default" : "ghost"}
                size="sm"
                onClick={() => setActiveTab("participant")}
                className="whitespace-nowrap"
              >
                Participant
              </Button>
              <Button
                variant={activeTab === "user" ? "default" : "ghost"}
                size="sm"
                onClick={() => setActiveTab("user")}
                className="whitespace-nowrap"
              >
                User
              </Button>
              <Button
                variant={activeTab === "error-handling" ? "default" : "ghost"}
                size="sm"
                onClick={() => setActiveTab("error-handling")}
                className="whitespace-nowrap"
              >
                Error
              </Button>
              <Button
                variant={activeTab === "data" ? "default" : "ghost"}
                size="sm"
                onClick={() => setActiveTab("data")}
                className="whitespace-nowrap"
              >
                Data
              </Button>
            </div>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === "shared" && <SharedComponentsTab />}
        {activeTab === "widgets" && <WidgetComponentsTab />}
        {activeTab === "record" && <RecordComponentsTab />}
        {activeTab === "competition" && <CompetitionComponentsTab />}
        {activeTab === "division" && <DivisionComponentsTab />}
        {activeTab === "participant" && <ParticipantComponentsTab />}
        {activeTab === "user" && <UserComponentsTab />}
        {activeTab === "error-handling" && <ErrorHandlingComponentsTab />}
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

      {/* Participant Modals */}
      <AdminParticipantCreateModal
        isOpen={isParticipantCreateModalOpen}
        onClose={() => setIsParticipantCreateModalOpen(false)}
        onSubmit={handleParticipantCreateSubmit}
        divisions={divisions}
        preSelectedDivisionId={selectedDivisionId}
      />

      <AdminParticipantEditModal
        isOpen={isParticipantEditModalOpen}
        onClose={() => {
          setIsParticipantEditModalOpen(false);
          setSelectedParticipant(null);
        }}
        onSubmit={handleParticipantEditSubmit}
        participant={selectedParticipant}
        divisions={divisions}
      />

      <AdminParticipantDeleteModal
        isOpen={isParticipantDeleteModalOpen}
        onClose={() => {
          setIsParticipantDeleteModalOpen(false);
          setSelectedParticipant(null);
        }}
        onConfirm={handleParticipantDeleteConfirm}
        participant={selectedParticipant}
      />

      {/* User Modals */}
      <AdminUserCreateModal
        isOpen={isUserCreateModalOpen}
        onClose={() => setIsUserCreateModalOpen(false)}
        onSubmit={handleUserCreateSubmit}
      />

      <AdminUserEditRolesModal
        isOpen={isUserEditRolesModalOpen}
        onClose={() => {
          setIsUserEditRolesModalOpen(false);
          setSelectedUser(null);
        }}
        onSubmit={handleUserEditRolesSubmit}
        user={selectedUser}
      />

      <AdminUserDeleteModal
        isOpen={isUserDeleteModalOpen}
        onClose={() => {
          setIsUserDeleteModalOpen(false);
          setSelectedUser(null);
        }}
        onConfirm={handleUserDeleteConfirm}
        user={selectedUser}
      />
    </div>
  );
};

// Error Handling Components Tab
function ErrorHandlingComponentsTab() {
  const errorHandlingService = useErrorHandlingService();

  // 다양한 에러 시뮬레이션 함수들
  const simulateAuthError = () => {
    const authError = new AuthenticationError("세션이 만료되었습니다. 다시 로그인해주세요.");
    errorHandlingService.handle(authError, "Showcase Demo", (path) => {
      console.log("Would redirect to:", path);
      // 실제 페이지에서는 navigate(path) 호출
    });
  };

  const simulateAuthzError = () => {
    const authzError = new AuthorizationError("관리자 권한이 필요합니다.");
    errorHandlingService.handle(authzError, "Showcase Demo", (path) => {
      console.log("Would redirect to:", path);
      // 실제 페이지에서는 navigate(path) 호출
    });
  };

  const simulateServerError = () => {
    const serverError = new ServerError("내부 서버 오류가 발생했습니다.", 500);
    errorHandlingService.handle(serverError, "Showcase Demo");
  };

  const simulateValidationError = () => {
    const validationError = new ValidationError("입력값이 올바르지 않습니다. 이메일 형식을 확인해주세요.");
    errorHandlingService.handle(validationError, "Showcase Demo");
  };

  const simulateNotFoundError = () => {
    const notFoundError = new NotFoundError("요청한 리소스를 찾을 수 없습니다.");
    errorHandlingService.handle(notFoundError, "Showcase Demo");
  };

  const simulateBusinessError = () => {
    const businessError = new TimerLogConsecutiveError("연속된 타이머 로그는 생성할 수 없습니다.");
    errorHandlingService.handle(businessError, "Showcase Demo");
  };

  const simulateJavaScriptError = () => {
    const jsError = new Error("예기치 못한 JavaScript 에러가 발생했습니다.");
    errorHandlingService.handle(jsError, "Showcase Demo");
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-4">Error Handling Components</h2>
        <p className="text-muted-foreground mb-6">
          에러 처리 시스템을 테스트할 수 있는 컴포넌트들입니다. 각 버튼을 클릭하여 다양한 유형의 에러가 어떻게
          처리되는지 확인해보세요.
        </p>
      </div>

      {/* Modal 에러 테스트 */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Modal 에러 (페이지 이동 포함)</h3>
        <p className="text-sm text-muted-foreground mb-4">
          치명적이거나 페이지 이동이 필요한 에러들입니다. 모달로 표시되며, 확인 시 적절한 액션이 수행됩니다.
        </p>
        <div className="grid grid-cols-2 gap-3">
          <Button onClick={simulateAuthError} variant="destructive">
            인증 에러 (401)
          </Button>
          <Button onClick={simulateAuthzError} variant="destructive">
            권한 에러 (403)
          </Button>
        </div>
      </Card>

      {/* Toast 에러 테스트 */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Toast 에러</h3>
        <p className="text-sm text-muted-foreground mb-4">
          일반적인 에러들입니다. 토스트로 표시되며 자동으로 사라집니다.
        </p>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          <Button onClick={simulateServerError} variant="outline">
            서버 에러 (5xx)
          </Button>
          <Button onClick={simulateValidationError} variant="outline">
            검증 에러 (422)
          </Button>
          <Button onClick={simulateNotFoundError} variant="outline">
            404 에러
          </Button>
          <Button onClick={simulateBusinessError} variant="outline">
            비즈니스 에러
          </Button>
          <Button onClick={simulateJavaScriptError} variant="outline">
            JavaScript 에러
          </Button>
        </div>
      </Card>
    </div>
  );
}
