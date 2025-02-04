import { connect, type NatsConnection } from "jsr:@nats-io/transport-deno@^3.0.0-21"
import {
    type ConsumerCallbackFn,
    type ConsumerConfig,
    jetstream,
    type JetStreamClient,
    type JetStreamManager,
    jetstreamManager,
    type OrderedConsumerOptions,
    type StreamConfig
} from "jsr:@nats-io/jetstream@^3.0.0-37";
import type { WithRequired } from "jsr:@nats-io/nats-core@^3.0.0-50/internal";
import process from "node:process";

class Nats {
    public natsConnection?: NatsConnection
    public jetStreamManager?: JetStreamManager
    private jetStreamClient?: JetStreamClient

    server?: string = process.env.JWT_KEY

    constructor(server?: string) {
        this.server = server
    }

    async init() {
        const natsConnection = await connect({ servers: this.server })
        const jetStreamManager = await jetstreamManager(natsConnection)

        this.jetStreamClient = jetstream(natsConnection)
        this.jetStreamManager = jetStreamManager
        this.natsConnection = natsConnection
    }

    async addStream(config: WithRequired<Partial<StreamConfig>, "name">) {
        await this.init()
        if (!this.jetStreamManager) {
            console.log('jetStreamManager is undefined!')
            return
        }
        await this.jetStreamManager.streams.add(config)
    }

    async addConsumer(stream: string, config: Partial<ConsumerConfig>) {
        await this.init()
        if (!this.jetStreamManager) {
            console.log('jetStreamManager is undefined!')
            return
        }
        await this.jetStreamManager.consumers.add(stream, config)
    }

    async consume(
        stream: string,
        consumerName?: string | Partial<OrderedConsumerOptions>,
        callback?: ConsumerCallbackFn | undefined
    ) {
        await this.init()
        if (!this.jetStreamClient) {
            console.log('jetStreamClient is undefined!')
            return
        }

        const consumer = await this.jetStreamClient.consumers.get(stream, consumerName)

        await consumer.consume({ callback })

        return consumer
    }

    // async publish(subject: string, payload: Payload) {
    async publish<T>(subject: string, payload?: T ) {
        await this.init()
        if (!this.jetStreamClient) {
            console.log('jetStreamClient is undefined!')
            return
        }

        await this.jetStreamClient.publish(subject, payload?.toString())
    }

    async getConsumer(stream: string,
        consumerName?: string | Partial<OrderedConsumerOptions>
    ) {
        if (!this.jetStreamClient) {
            console.log('jetStreamClient is undefined!')
            return
        }
        return await this.jetStreamClient.consumers.get(stream, consumerName)
    }
}

export const nats = new Nats()