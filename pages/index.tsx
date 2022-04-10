import type { NextPage, GetServerSideProps } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import { sanityClient, urlFor } from '../sanity';
import { Collection } from '../typings';

interface Props { 
  collections: Collection[];
}

const Home: NextPage<Props> = ({ collections }) => {
  return (
    <div className="mx-auto flex max-w-7xl min-h-screen flex-col py-20 px-10 2xl:px-0">
      <Head>
        <title>NFT Mint</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <h1 className="mb-10 text-4xl font-extralight">
        The{' '} 
        <span className="font-extrabold underline decoration-pink-600/50">Apes</span>{' '} 
        NFT market place
      </h1>

      <main className="bg-slate-100 p-10 shadow-xl shadow-rose-400/50">
        <div className="grid space-x-3 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
          {collections.map(collection => (
            <Link key={collection._id} href={`/nft/${collection.slug.current}`}>
              <div className="flex flex-col items-center cursor-pointer transition-all duration-200 hover:scale-105">
                <img
                  className="h-96 w-60 rounded-xl object-cover" 
                  src={urlFor(collection.mainImage).url()} 
                  alt={collection.title} 
                />

                <div className="p-5">
                  <h2 className="text-3xl">{collection.title}</h2>
                  <p className="mt-2 text-sm text-gray-400">{collection.description}</p>
                </div>
              </div>
            </Link>
            
          ))}
        </div>
      </main>
    </div>
  )
}

export default Home;

export const getServerSideProps: GetServerSideProps = async () => {
  const query = `
    *[_type == "collection"]{
      _id,
      title,
      description,
      nftCollectionName,
      creator -> {
        _id,
        name,
        address,
        image,
        slug {
          current
        }
      },
    mainImage,
    previewImage,
    slug,
    body
    }
  `

  const collections = await sanityClient.fetch(query);

  return {
    props: {
      collections
    }
  }
}
