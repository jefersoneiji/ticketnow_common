import type { NatsConnection } from "jsr:@nats-io/transport-deno@^3.0.0-21"
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

export const init = async (connection: NatsConnection) => {
    const jetStreamManager = await jetstreamManager(connection)
    const jetStreamClient = jetstream(connection)
    return { jetStreamManager, jetStreamClient, natsConnection: connection }
}

export class nats {
    public natsConnection: NatsConnection
    public jetStreamManager: JetStreamManager
    private jetStreamClient: JetStreamClient

    constructor(connection: NatsConnection, jetStreamClient: JetStreamClient, jetStreamManager: JetStreamManager) {
        this.jetStreamManager = jetStreamManager
        this.jetStreamClient = jetStreamClient
        this.natsConnection = connection

        process.on('exit', async () => await connection.close())
    }

    async addStream(config: WithRequired<Partial<StreamConfig>, "name">) {
        await this.jetStreamManager.streams.add(config)
    }

    async addConsumer(stream: string, config: Partial<ConsumerConfig>) {
        await this.jetStreamManager.consumers.add(stream, config)
    }

    async consume(
        stream: string,
        consumerName?: string | Partial<OrderedConsumerOptions>,
        callback?: ConsumerCallbackFn | undefined
    ) {
        const consumer = await this.jetStreamClient.consumers.get(stream, consumerName)

        await consumer.consume({ callback })

        return consumer
    }

    async publish<T>(subject: string, payload: T) {
        await this.jetStreamClient.publish(subject, JSON.stringify(payload))
    }

    async listen(
        streamName: string,
        consumerName: string | undefined,
        consumerConfig: Partial<ConsumerConfig>,
        consumerCallback?: ConsumerCallbackFn
    ) {
        await this.addConsumer(streamName, consumerConfig)
        await this.consume(streamName, consumerName, consumerCallback)

        this.listenerCleanUp(streamName, consumerName)
    }

    listenerCleanUp(streamName: string, consumerName?: string) {
        process.on('SIGTERM', async () => {
            const consumer = await this.getConsumer(streamName, consumerName)
            consumer.delete()
            process.exit()
        })
        process.on('SIGINT', async () => {
            const consumer = await this.getConsumer(streamName, consumerName)
            consumer.delete()
            process.exit()
        })
    }

    async getConsumer(stream: string,
        consumerName?: string | Partial<OrderedConsumerOptions>
    ) {
        return await this.jetStreamClient.consumers.get(stream, consumerName)
    }
}
