import type { Subjects } from "./subjects.ts";

interface IEvent {
    id: string,
    version: number
}

export interface ITicketCreated<T> {
    subject: Subjects.TicketCreated,
    data: T & IEvent
}

export interface ITicketUpdated<T> {
    subject: Subjects.TicketUpdated,
    data: T & IEvent
}