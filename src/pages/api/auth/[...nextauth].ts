import { query as q } from 'faunadb';
import { fauna } from "../../../services/fauna";
import NextAuth from "next-auth";
import GithubProviders from 'next-auth/providers/github';

export default NextAuth({
  providers: [
    GithubProviders({
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      authorization: { params: { scope: 'read:user'}},
    })
  ],
  callbacks: {
    async session({session}) {
      try {
        const userActiveSubscription = await fauna.query<string>(
          q.Get(
            q.Intersection([
              q.Match(
                q.Index('subscription_by_user_ref'),
                q.Select(
                  'ref',
                  q.Get(
                    q.Match(
                      q.Index('user_by_email'),
                      q.Casefold(session.user.email)
                    )
                  )
                )
              ),
              q.Match(
                q.Index('subscription_by_status'),
                "active"
              )
            ])
          )
        )

        return {
          ...session,
          activeSubscription: userActiveSubscription
        }
      } catch {
        return {
          ...session,
          activeSubscription: null
        }
      }
    },
    async signIn({user}) {
      const { email } = user;

      try {
        fauna.query(
          q.If(q.Not(q.Exists(q.Match(
            q.Index('user_by_email'),
            q.Casefold(user.email)
          ))),
            q.Create(
              q.Collection('users'), { data: { email } }
            ),
            q.Get(
              q.Match(
                q.Index('user_by_email'),
                q.Casefold(user.email)
              )
            )
          )
        );
        console.log(user)
        return true;
      } catch {
        return false
      }
    }
  }
})