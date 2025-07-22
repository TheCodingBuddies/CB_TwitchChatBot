export interface SubscriptionEvent {
    type: string,
    version: string,
    condition: {
        broadcaster_user_id: string,
        reward_id?: string,
    },
    transport: {
        method: string,
        session_id: string,
    }
}
