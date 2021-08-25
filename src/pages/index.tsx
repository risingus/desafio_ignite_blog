import { GetStaticProps } from 'next';

import { getPrismicClient } from '../services/prismic';
import Prismic from '@prismicio/client';
import Link from 'next/link';
import { FiUser, FiCalendar } from 'react-icons/fi';
import { format } from 'date-fns';
import brLocale from 'date-fns/locale/pt-BR';

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
  posts: Post[];
}

export default function Home({ posts }: HomeProps) {
  const maisPosts = posts.length > 2;
  return (
    <div className={styles.home}>
      <div>
        <div className={styles.logo}>
          <img src="/Logo.svg" alt="logo" />
        </div>

        {posts.map(post => (
          <Link href={`post/${post.uid}`} key={post.uid}>
            <div className={commonStyles.postBox} >
              <h1>{post.data.title}</h1>
              <p>{post.data.subtitle}</p>
              <div className={styles.dateAuthorBox}>
                <div className={styles.iconsBox}>
                  <FiCalendar className={styles.icons} />
                  <span>{post.first_publication_date}</span>
                </div>

                <div className={styles.iconsBox}>
                  <FiUser className={styles.icons} />
                  <span>{post.data.author}</span>
                </div>
              </div>
            </div>
          </Link>
        ))}

        {maisPosts && (
          <button className={styles.maisPosts}>
            <p>Carregar mais posts</p>
          </button>
        )}
      </div>
    </div>
  );
}

export const getStaticProps = async () => {
  const prismic = getPrismicClient();

  const postsResponse = await prismic.query(
    [Prismic.predicates.at('document.type', 'blog')],
    {
      fetch: ['blog.title', 'blog.subtitle', 'blog.content', 'blog.author'],
      pageSize: 3,
    }
  );

  const posts = postsResponse.results.map(post => {
    return {
      uid: post.uid,
      data: {
        title: post.data.title,
        author: post.data.author,
        subtitle: post.data.subtitle
      },
      first_publication_date: format(new Date(post.last_publication_date), 'dd MMM yyyy', {
        locale: brLocale,
      }),
    };
  });

  return {
    props: {
      posts,
    },
  };
};
