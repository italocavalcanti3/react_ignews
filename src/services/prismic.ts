import * as Prismic from '@prismicio/client';

export function getPrismicClient(req?: unknown) {
  const repositoryName = 'ignews-italocavalcanti3'

  const prismic = Prismic.createClient(
    repositoryName,
    {
      accessToken: process.env.PRISMIC_ACCESS_TOKEN,
    }
  );

  return prismic;
}