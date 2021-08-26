/* eslint-disable prettier/prettier */
/* eslint-disable react/no-danger */
import { GetStaticPaths, GetStaticProps } from 'next';
import { RichText } from 'prismic-dom';
import { FiUser, FiCalendar, FiClock } from 'react-icons/fi';
import Prismic from '@prismicio/client';
import { useRouter } from 'next/router';

import { format } from 'date-fns';
import brLocale from 'date-fns/locale/pt-BR';
import { Fragment, ReactElement } from 'react';
import { getPrismicClient } from '../../services/prismic';

import Header from '../../components/Header';
import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';

interface Post {
  first_publication_date: string | null;
  data: {
    title: string;
    banner: {
      url: string;
    };
    author: string;
    content: {
      body: {
        text: string;
      }[];
      heading: string;
    }[];
  };
}

interface PostProps {
  post: Post;
}

export default function Post({ post }: PostProps): ReactElement {
  const router = useRouter();

  if (router.isFallback) {
    return <div>Carregando...</div>;
  }

  const formatDate = (date): string => {
    const formatedDate = format(new Date(date), 'dd MMM yyy', {
      locale: brLocale,
    });
    return formatedDate;
  };

  const timeToRead = (): string => {
    const wordPerMinute = 200;

    const wordsOfBody = (RichText.asText(
      post.data.content.reduce((acc, data) => [...acc, ...data.body], [])
    )).split(' ').length;

    const wordsOfHeading = post.data.content.reduce((acc, data) => {
      if (data.heading) {
        return [...acc, ...data.heading.split(' ')];
      }

      return [...acc];
    }, []).length;

    const readingTime = Math.ceil(
      (wordsOfHeading + wordsOfBody) / wordPerMinute
    );

    return `${readingTime}`;
  };

  return (
    <div className={styles.post}>
      <Header />
      <img
        src={`${post.data.banner.url}`}
        alt="post banner"
        className={styles.banner}
      />

      <div className={commonStyles.postReading}>
        <h1>{post.data.title}</h1>

        <div className={styles.iconsBox}>
          <div className={styles.iconBox}>
            <FiCalendar className={styles.icons} />
            <p>{formatDate(post.first_publication_date)}</p>
          </div>

          <div className={styles.iconBox}>
            <FiUser className={styles.icons} />
            <p>{post.data.author}</p>
          </div>

          <div className={styles.iconBox}>
            <FiClock className={styles.icons} />
            <span>{`${timeToRead()} min`}</span>
          </div>
        </div>

        {post.data.content.map(content => (
          <Fragment key={content.heading}>
            <h2 className={styles.heading}>{content.heading}</h2>
            <div
              dangerouslySetInnerHTML={{
                __html: RichText.asHtml(content.body),
              }}
              className={styles.postContent}
            />
          </Fragment>
        ))}
      </div>
    </div>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const prismic = getPrismicClient();
  const posts = await prismic.query(
    [Prismic.predicates.at('document.type', 'blog')],
    {
      fetch: ['blog.title', 'blog.subtitle', 'blog.content', 'blog.author'],
    }
  );

  const paths = posts.results.map(obj => {
    return { params: { slug: obj.uid } };
  });

  return {
    paths,
    fallback: true,
  };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const { slug } = params;
  const prismic = getPrismicClient();
  const response = await prismic.getByUID('blog', String(slug), {});

  return {
    props: {
      post: response,
    },
  };
};
