import { GetStaticProps } from 'next';

import Prismic from '@prismicio/client';
import Link from 'next/link';
import { ReactElement, useState } from 'react';
import { FiUser, FiCalendar } from 'react-icons/fi';
import { format } from 'date-fns';
import brLocale from 'date-fns/locale/pt-BR';
import { getPrismicClient } from '../services/prismic';

import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';

interface Post {
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
}

interface PostPagination {
  next_page: string;
  results: Post[];
}

interface HomeProps {
  postsPagination?: PostPagination;
}

export default function Home({ postsPagination }: HomeProps): ReactElement {
  const [posts, setPosts] = useState(postsPagination.results);
  const [next_page, setNextPage] = useState(postsPagination.next_page);

  async function loadMorePosts(): Promise<void> {
    if (next_page === null) return;

    await fetch(next_page)
      .then(response => response.json())
      .then(data => {
        const newPosts = data.results.map(post => {
          return {
            uid: post.uid,
            first_publication_date: post.first_publication_date,
            data: {
              title: post.data.title,
              subtitle: post.data.subtitle,
              author: post.data.author,
            },
          };
        });

        setPosts([...posts, ...newPosts]);
        setNextPage(data.next_page);
      });
  }

  return (
    <div className={styles.home}>
      <div>
        <div className={styles.logo}>
          <img src="/Logo.svg" alt="logo" />
        </div>

        {posts.map(post => (
          <Link href={`post/${post.uid}`} key={post.uid}>
            <div className={commonStyles.postBox}>
              <h1>{post.data.title}</h1>
              <p>{post.data.subtitle}</p>
              <div className={styles.dateAuthorBox}>
                <div className={styles.iconsBox}>
                  <FiCalendar className={styles.icons} />
                  <span>
                    {format(
                      new Date(post.first_publication_date),
                      'dd MMM yyyy',
                      { locale: brLocale }
                    )}
                  </span>
                </div>

                <div className={styles.iconsBox}>
                  <FiUser className={styles.icons} />
                  <span>{post.data.author}</span>
                </div>
              </div>
            </div>
          </Link>
        ))}

        {next_page && (
          <button
            type="button"
            className={styles.maisPosts}
            onClick={loadMorePosts}
          >
            <p>Carregar mais posts</p>
          </button>
        )}
      </div>
    </div>
  );
}

export const getStaticProps: GetStaticProps<HomeProps> = async () => {
  const prismic = getPrismicClient();

  const postsResponse = await prismic.query(
    [Prismic.predicates.at('document.type', 'blog')],
    {
      fetch: ['blog.title', 'blog.subtitle', 'blog.content', 'blog.author'],
      pageSize: 2,
    }
  );

  const posts = postsResponse.results.map(post => {
    return {
      uid: post.uid,
      data: {
        title: post.data.title,
        author: post.data.author,
        subtitle: post.data.subtitle,
      },
      first_publication_date: post.first_publication_date,
    };
  });

  const { next_page } = postsResponse;

  return {
    props: {
      postsPagination: {
        next_page,
        results: posts,
      },
    },
  };
};
