import { GetStaticPaths, GetStaticProps } from 'next';
import { api } from '../../services/api';
import { format, parseISO } from 'date-fns'
import ptBR from 'date-fns/locale/pt-BR'
import { convertDurationToTimeString } from '../../utils/convertDurationToTimeString'
import styles from './episode.module.scss'
import Image from 'next/image'
import Link from 'next/link'
import { usePlayer } from '../../contexts/PlayerContext';
import Head from 'next/head'

type Episode = {
    id: string;
    title: string;
    members: string;
    published_at: string;
    thumbnail: string;
    duration: number;
    durationAsString: string;
    url: string;
    description: string;
}

type EpisodeProps = {
    episode: Episode;
}

export default function Episode({ episode }: EpisodeProps) {
    const { play } = usePlayer();

    return (
        <div className={styles.episode}>
            <Head>
                <title>{episode.title} | Podcastr</title>
            </Head>

            <div className={styles.thumbnail}>
                <Link href="/">
                    <button type="button">
                        <img src="/arrow-left.svg" alt="Voltar" />
                    </button>
                </Link>
                <Image
                    width={700}
                    height={160}
                    src={episode.thumbnail}
                    objectFit="cover"
                />
                <button type="button" onClick={() => play(episode)}>
                    <img src="/play.svg" alt="Tocar episódio" />
                </button>
            </div>

            <header>
                <h1>{episode.title}</h1>
                <span>{episode.members}</span>
                <span>{episode.published_at}</span>
                <span>{episode.durationAsString}</span>
            </header>

            <div
                className={styles.description}
                dangerouslySetInnerHTML={{ __html: episode.description }}
            />
        </div>
    )
}

// PATHS --> PARÂMETROS QUE O NEXT USARÁ PARA GERAR AS PÁGINAS ESTÁTICAS DINÂMICAMENTE
// CASO SEJA MANDADO [] VAZIO, O NEXT NÃO IRÁ GERAR PÁGINAS ESTÁTICAS DESSA PÁGINA

// FALLBACK --> CASO SEJA PASSADO 'blocking', A PÁGINA QUE FOR ACESSADA QUE NÃO TENHA
// SIDO GERADA NA BUILD, O NEXT BUSCARÁ OS DADOD DE getStaticProps PELO LADO DO SERVER
// CASO FALLBACK SEJA true, A PÁGINA QUE FOR ACESSADA QUE NÃO TENHA SIDO GERADA NA BUILD,
// O NEXT BUSCARÁ OS DADOS GE getStaticProps PELO LADO DO BROWSER, NÃO PELO SERVER
// CASO FALLBACK SEJA false, A PÁGINA NÃO PODERÁ SER ACESSADA CASO NÃO TENHA SIDO GERADA
// DINÂMICAMENTE NA BUILD
export const getStaticPaths: GetStaticPaths = async () => {
    const { data } = await api.get('episodes', {
        params: {
            _limit: 12,
            _sort: 'published_at',
            _order: 'desc'
        }
    })

    const paths: any[] = data.map((episode) => {
        return {
            params: { slug: episode.id }
        }
    });

    return {
        paths,
        fallback: 'blocking'
    }
}

export const getStaticProps: GetStaticProps = async (context) => {
    const { slug } = context.params;
    const { data } = await api.get(`/episodes/${slug}`);

    const episode: Episode = {
        id: data.id,
        title: data.title,
        thumbnail: data.thumbnail,
        members: data.members,
        published_at: format(parseISO(data.published_at), 'd MMM yy', { locale: ptBR }),
        duration: Number(data.file.duration),
        durationAsString: convertDurationToTimeString(Number(data.file.duration)),
        description: data.description,
        url: data.file.url
    }

    return {
        props: {
            episode
        },
        revalidate: 60 * 60 * 24 //24 hours
    }
}
