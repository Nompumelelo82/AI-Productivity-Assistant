export type ServiceCategory =
  | "Plumbing"
  | "Electrical"
  | "Painting"
  | "Handyman"
  | "General Repairs";

export type JobStatus =
  | "New"
  | "Quoted"
  | "Scheduled"
  | "In Progress"
  | "Completed"
  | "Cancelled";

export type Priority = "Low" | "Medium" | "High" | "Urgent";

export type Customer = {
  id: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  suburb: string;
  notes: string;
  createdAt: string;
};

export type Job = {
  id: string;
  reference: string;
  customerId: string;
  service: ServiceCategory;
  title: string;
  description: string;
  status: JobStatus;
  priority: Priority;
  appointmentDate: string; // ISO date
  time: string; // HH:mm
  durationMins: number;
  technician: string;
  amount: number;
  location: string;
  equipment: string[];
  notes: string;
};

export type Quote = {
  id: string;
  number: string;
  customerId: string;
  jobId?: string;
  service: ServiceCategory;
  labour: number;
  materials: number;
  travel: number;
  additional: number;
  notes: string;
  status: "Draft" | "Sent" | "Accepted" | "Declined";
  createdAt: string;
};

export type Invoice = {
  id: string;
  number: string;
  customerId: string;
  jobId?: string;
  jobTitle: string;
  amount: number;
  status: "Paid" | "Pending" | "Overdue";
  date: string;
};

export type Message = {
  id: string;
  from: "customer" | "business";
  body: string;
  at: string;
};

export type Conversation = {
  id: string;
  customerId: string;
  subject: string;
  unread: boolean;
  archived: boolean;
  messages: Message[];
};

export type Appointment = {
  id: string;
  jobId?: string;
  customerId?: string;
  title: string;
  service: ServiceCategory;
  date: string; // yyyy-mm-dd
  time: string; // HH:mm
  durationMins: number;
  priority: Priority;
  location: string;
  notes: string;
};

export type Notification = {
  id: string;
  kind: "appointment" | "urgent" | "quote" | "followup" | "waiting" | "payment";
  title: string;
  detail: string;
  at: string;
  read: boolean;
};

export type CustomerRequest = {
  id: string;
  customerId?: string;
  customerName: string;
  channel: "WhatsApp" | "Email" | "Website" | "Phone";
  body: string;
  receivedAt: string;
  handled: boolean;
};

export type Tone = "Friendly" | "Professional" | "Short" | "Apologetic" | "Urgent" | "Persuasive";
