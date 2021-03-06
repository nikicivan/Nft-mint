import { GetServerSideProps, NextPage } from 'next'
import React, { useState, useEffect } from 'react';
import { useAddress, useDisconnect, useMetamask, useNFTDrop } from "@thirdweb-dev/react";
import { sanityClient, urlFor } from '../../sanity';
import { Collection } from '../../typings';
import toast, { Toaster } from 'react-hot-toast';
import Link from 'next/link';
import { BigNumber } from 'ethers';

interface Props {
  collection: Collection;
}

const NftDropPage: NextPage<Props> = ({ collection }) => {
  const [claimedSupply, setClaimedSupply] = useState<number>(0);
  const [totalSupply, setTotalSupply] = useState<BigNumber>();
  const [priceInEth, setPriceInEth] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  
  const nftDrop = useNFTDrop(collection.address);

  // Auth
  const connectWithMetamask = useMetamask();
  const address = useAddress();
  const disconnect = useDisconnect();
  // 

  useEffect(() => {
    if (!nftDrop) return;

    const fetchNftDropData = async () => {
      setLoading(true);
      const claimedCondition = await nftDrop.claimConditions.getAll();
      const claimed = await nftDrop.getAllClaimed();
      const total = await nftDrop.totalSupply();

      setClaimedSupply(claimed.length);
      setTotalSupply(total);
      setPriceInEth(claimedCondition?.[0]?.currencyMetadata.displayValue);

      setLoading(false);
    }

    fetchNftDropData();
  }, [nftDrop]);

  const mintNFT = () => {
    if (!nftDrop || !address) return;

    setLoading(true);

    const notification = toast.loading('Minting NFT..', {
      style: {
        background: 'white',
        color: 'green',
        fontWeight: 'bolder',
        fontSize: '17px',
        padding: '20px'
      }
    })

    const quantity = 1; //how many unique NFTs you want to claim

    nftDrop
      .claimTo(address, quantity)
      .then(async (tx) => {
        const receipt = tx[0].receipt; // the transaction receipt
        const claimedTokenId = tx[0].id // the ID of the NFT claimed
        const claimedNFT = await tx[0].data() // (optional) get the claimed NFT metada

        toast.success('Horaayyy!!! Successfully minted NFT!', {
          duration: 8000,
          style: {
            background: 'green',
            color: 'white',
            fontWeight: 'bolder',
            fontSize: '17px',
            padding: '20px'
          }
        })
        
        console.log(receipt);
        console.log(claimedTokenId);
        console.log(claimedNFT);  
      })
      .catch(error => {
        console.log(error);
        toast.error('Woops, something went wrong!', {
          style: {
            background: 'red',
            color: 'white',
            fontWeight: 'bolder',
            fontSize: '17px',
            padding: '20px'
          }
        })
      })
      .finally(() => {
        setLoading(false);
        toast.dismiss(notification)
      }) 
  }

  return (
    <div className="flex h-screen flex-col lg:grid lg:grid-cols-10">
      <Toaster position='bottom-center' />
      {/* Left */}
      <div className="bg-gradient-to-br from-cyan-500 to-rose-500 lg:col-span-4">
        <div className='flex flex-col items-center justify-start py-2 lg:min-h-screen'>
          <div className='rounded-xl bg-gradient-to-br from-yellow-400 to-purple-600 p-2'>
            <img
              className="w-44 rounded-xl object-cover lg:h-96 lg:w-72" 
              src={urlFor(collection.mainImage).url()}
              alt={collection.nftCollectionName}
            />
          </div>          
          <div className='text-center p-5 space-y-2'>
            <h1 className="text-4xl font-bold text-white">{collection.nftCollectionName}</h1>
            <h2 className="text-xl text-gray-300">{collection.description}</h2>
          </div>
        </div>
      </div>

      {/* Right */}
      <div className="flex flex-1 flex-col p-12 lg:col-span-6">
        {/* Header */}
        <header className="flex items-center justify-between">
          <Link href="/">
            <h1 className="w-52 cursor-pointer text-xl font-extralight sm:w-80">
              The{' '} 
              <span className="font-extrabold underline decoration-pink-600/50">Apes</span>{' '} 
              NFT market place
            </h1>
          </Link>
         
          <button 
            className="rounded-full bg-rose-400 px-4 py-2 text-xs font-bold text-white lg:px-5 lg:py-3 lg:text-base"
            onClick={() => address ? disconnect() : connectWithMetamask()}
          >
            {address ? 'Sign Out' : 'Sign In' }
          </button>
        </header>

        <hr className="my-2 border" />

        {address && (
          <p className="text-center text-sm text-rose-400">You are logged in with wallet {address.substring(0,5)}...{address.substring(address.length - 5)}</p>
        )}

        {/* Content */}
        <div className="mt-10 flex flex-1 flex-col items-center space-y-6 text-center lg:space-y-0 lg:justify-center"> 
          <img
            className="w-80 object-cover pb-10 lg:h-80" 
            src={urlFor(collection.previewImage).url()} 
            alt={collection.title} 
          />
          <h1 className="text-3xl font-bold lg:text-5xl lg:font-extrabold">{collection.title}</h1>
          {loading && <p className="pt-2 text-xl text-green-500 animate-pulse">Loading supply...</p>}
          {!loading && <p className="pt-2 text-xl text-green-500">{claimedSupply}/{totalSupply?.toString()} NFT Claimed</p>}

          {loading && (
            <img className="h-80 w-80 object-contain" src="https://cdn.hackernoon.com/images/0*4Gzjgh9Y7Gu8KEtZ.gif" alt="loading"/>
          )}
        </div>

        {/* Mint button */}
        <button
          onClick={mintNFT}
          disabled={loading || claimedSupply === totalSupply?.toNumber() || !address} 
          className="h-16 bg-red-600 w-full text-white rounded-full mt-2 font-bold disabled:bg-gray-400"
        >
          {loading ? (
            <>Loading</>
          ) : claimedSupply === totalSupply?.toNumber() ? (
            <>SOLD OUT</>
          ) : !address ? (
            <>Sign in to Mint!</>
          ) : (
            <span className="font-bold">Mint NFT ({priceInEth} ETH)</span>
          )}
        </button>
      </div>
    </div>
  )
}

export default NftDropPage;

export const getServerSideProps: GetServerSideProps = async ({ params }) => {
  const query = `
    *[_type == "collection" && slug.current == $id][0]{
      _id,
      title,
      description,
      address,
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

  const collection = await sanityClient.fetch(query, {
    id: params?.id
  })

  if (!collection) {
    return {
      notFound: true,
    }
  }

  return {
    props: {
      collection
    }
  }
}