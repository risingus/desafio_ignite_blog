/* eslint-disable react/no-danger */
import { GetStaticPaths, GetStaticProps } from 'next';
import { RichText } from 'prismic-dom';
import { FiUser, FiCalendar, FiClock } from 'react-icons/fi';
import Prismic from '@prismicio/client';

import { format } from 'date-fns';
import brLocale from 'date-fns/locale/pt-BR';
import { ReactElement } from 'react';
import { getPrismicClient } from '../../services/prismic';

import Header from '../../components/Header';
import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';

interface Post {
  first_publication_date: string | null;
  teste: any;
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
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  const timeToRead = () => {
    const { teste } = post.data;
    const wordPerMinute = 220;

    const allWords = teste.reduce((allWord, word) => {
      return String(allWord + word.text);
    });

    const words = allWords.split(' ').lenght;

    console.log(words);
  };

  timeToRead();

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
            <p>{post.first_publication_date}</p>
          </div>

          <div className={styles.iconBox}>
            <FiUser className={styles.icons} />
            <p>{post.data.author}</p>
          </div>

          <div className={styles.iconBox}>
            <FiClock className={styles.icons} />
            <p>4 min</p>
          </div>
        </div>
        <div
          dangerouslySetInnerHTML={{ __html: post.data.content.body.text }}
          className={styles.postContent}
        />
      </div>
    </div>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  // const prismic = getPrismicClient();
  // const posts = await prismic.query(
  //   [Prismic.predicates.at('document.type', 'blog')],
  //   {
  //     fetch: ['blog.title', 'blog.subtitle', 'blog.content', 'blog.author'],
  //   }
  // );

  return {
    paths: [],
    fallback: 'blocking',
  };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const { slug } = params;
  const prismic = getPrismicClient();
  const response = await prismic.getByUID('blog', String(slug), {});

  const post = {
    first_publication_date: format(
      new Date(response.last_publication_date),
      'dd MMM yyyy',
      {
        locale: brLocale,
      }
    ),
    data: {
      title: response.data.title,
      banner: {
        url: String(response.data.banner.url),
      },
      teste: response.data.content[0].body,
      author: response.data.author,
      content: {
        heading: response.data.content[0].heading,
        body: {
          text: RichText.asHtml(response.data.content[0].body),
        },
      },
    },
  };

  return {
    props: {
      post,
    },
  };
};
