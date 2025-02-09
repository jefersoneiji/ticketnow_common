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

export interface IOrderCreated<T> {
    subject: Subjects.OrderCreated,
    data: T & IEvent
}

export interface IOrderUpdated<T> {
    subject: Subjects.OrderUpdated,
    data: T & IEvent
}

export interface IOrderCancelled<T> {
    subject: Subjects.OrderCancelled,
    data: T & IEvent
}