# ADR-0001: Use Supabase for Backend

## Status

Accepted

## Date

2024-XX-XX (Update with actual decision date)

## Context

IAABO Referee Hub needs a backend solution for:
- User authentication
- Data storage (PostgreSQL)
- API layer
- Real-time capabilities (optional)
- File storage (future)

The project is being developed with the Lovable platform, which has native Supabase integration.

## Decision

We will use Supabase as our Backend-as-a-Service (BaaS) platform.

## Consequences

### Positive

- **Rapid Development**: No need to build/maintain custom backend
- **Built-in Auth**: Complete authentication system out of the box
- **PostgreSQL**: Full-featured relational database
- **Type Generation**: Auto-generated TypeScript types from schema
- **Row Level Security**: Security at the database level
- **Real-time**: Built-in WebSocket subscriptions if needed
- **Edge Functions**: Serverless functions when custom logic is required
- **Lovable Integration**: Native support in our development platform

### Negative

- **Vendor Lock-in**: Dependent on Supabase platform
- **Cost Scaling**: Pricing model may not suit all scales
- **Limited Customization**: Some backend patterns harder to implement
- **Learning Curve**: Team needs to learn Supabase patterns

### Neutral

- Frontend architecture unchanged
- Can still use standard React patterns

## Alternatives Considered

1. **Custom Node.js/Express Backend**
   - Pros: Full control, familiar patterns
   - Cons: More development time, infrastructure to manage

2. **Firebase**
   - Pros: Mature platform, good documentation
   - Cons: NoSQL only, no native Lovable integration

3. **AWS Amplify**
   - Pros: Full AWS ecosystem
   - Cons: Complex setup, steeper learning curve

## References

- [Supabase Documentation](https://supabase.com/docs)
- [Lovable + Supabase Integration](https://docs.lovable.dev)
