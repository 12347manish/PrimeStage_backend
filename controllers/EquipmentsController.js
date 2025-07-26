// equipmentController.js
const express = require('express');

const getEquipmentsAndKits = (req, res) => {
  const equipments = [
    {
      name: 'Smoke Machine with extra Liquid',
      price: 2000,
      quantity: 0,
      image: 'https://homestagestorage.s3.ap-south-1.amazonaws.com/assets/images/df891a7f99b215f0fd4513ac5d4b29d6.jpg',
    },
    {
      name: 'LED Wall 8X20',
      price: 12000,
      quantity: 0,
      image: 'https://homestagestorage.s3.ap-south-1.amazonaws.com/assets/images/LED-video-wall_DJ-Booth-1.jpg',
    },
    {
      name: 'Cordless Mic',
      price: 650,
      quantity: 0,
      image: 'https://homestagestorage.s3.ap-south-1.amazonaws.com/assets/images/6c375856282ece70145a53be36eb7d23.jpg',
    },
    {
      name: 'Wired Mic',
      price: 400,
      quantity: 0,
      image: 'https://homestagestorage.s3.ap-south-1.amazonaws.com/assets/images/hand-holding-black-wired-microphone-against-white-background-microphone-ready-to-capture-sound-hand-holding-black-332742691.jpg.webp',
    },
    {
      name: 'LED Light',
      price: '300/per piece',
      quantity: 0,
      image: 'https://homestagestorage.s3.ap-south-1.amazonaws.com/assets/images/images.jpeg',
    },
    {
      name: 'Sharpy Light',
      price: '650/per piece',
      quantity: 0,
      image: 'https://homestagestorage.s3.ap-south-1.amazonaws.com/assets/images/ecf02e08a0ab50c0f29c5eee19c30b8e.jpg',
    },
    {
      name: 'Floor 12X12',
      price: 3500,
      quantity: 0,
      image: 'https://homestagestorage.s3.ap-south-1.amazonaws.com/assets/images/d13490a6d022a454f90e86d8bd1bf3d5.jpg',
    },
    {
      name: 'Floor 12X16',
      price: 4000,
      quantity: 0,
      image: 'https://homestagestorage.s3.ap-south-1.amazonaws.com/assets/images/34d819d82aaa1a02661c1c1225a556fe.jpg',
    },
  ];

  const kits = [
    {
      name: 'Signature Kit',
      price: 25000,
      image: 'https://homestagestorage.s3.ap-south-1.amazonaws.com/assets/images/83fa6f8303937819459f41b4e3e97ac3.jpg',
      includedItems: [
        {
          name: 'Operator',
          quantity: 'For entire event',
          image: 'https://homestagestorage.s3.ap-south-1.amazonaws.com/assets/images/dj-guy-with-long-hair-is-listening-his-brand-new-song-stereo-which-he-s-just-recorded-studio_341052-1990.jpg.avif'
        },
        {
          name: 'LED Walls',
          quantity: '8X20',
          image: 'https://homestagestorage.s3.ap-south-1.amazonaws.com/assets/images/LED-video-wall_DJ-Booth-1.jpg'
        },
        {
          name: 'LED Floor',
          quantity: '12X16',
          image: 'https://homestagestorage.s3.ap-south-1.amazonaws.com/assets/images/3d867743faa8ecc5dafa5865f8f7a7dd.jpg'
        },
        {
          name: 'Digital Mixer',
          quantity: 1,
          image: 'https://homestagestorage.s3.ap-south-1.amazonaws.com/assets/images/media_1d7ba5618ec377c7a90bab247f5cf79f7bcfd4a60.jpeg'
        },
        {
          name: 'Single Trust',
          quantity: 1,
          image: 'https://homestagestorage.s3.ap-south-1.amazonaws.com/assets/images/images-1.jpg'
        },
        {
          name: 'Base',
          quantity: 2,
          image: 'https://homestagestorage.s3.ap-south-1.amazonaws.com/assets/images/EV-EKX-18SP-Professional-18inch-powered-subwoofer.webp'
        },
        {
          name: 'Top',
          quantity: 4,
          image: 'https://homestagestorage.s3.ap-south-1.amazonaws.com/assets/images/jbl-top-speaker-model-stx825.jpg'
        },
        {
          name: 'Sharpy Lights',
          quantity: 4,
          image: 'https://homestagestorage.s3.ap-south-1.amazonaws.com/assets/images/ecf02e08a0ab50c0f29c5eee19c30b8e.jpg'
        },
        {
          name: 'Wireless Mic',
          quantity: 2,
          image: 'https://homestagestorage.s3.ap-south-1.amazonaws.com/assets/images/24df9fcf45f29584385561fe08d29ca8.jpg'
        },
      ],
    },
    {
      name: 'Prime Kit',
      price: 15000,
      image: 'https://homestagestorage.s3.ap-south-1.amazonaws.com/assets/images/b2c0e76d53a6b738d8e21198c249e8ef.jpg',
      includedItems: [
        {
          name: 'Operator',
          quantity: 'For entire event',
          image: 'https://homestagestorage.s3.ap-south-1.amazonaws.com/assets/images/dj-guy-with-long-hair-is-listening-his-brand-new-song-stereo-which-he-s-just-recorded-studio_341052-1990.jpg.avif'
        },
        {
          name: 'LED Floor',
          quantity: '12X16',
          image: 'https://homestagestorage.s3.ap-south-1.amazonaws.com/assets/images/3d867743faa8ecc5dafa5865f8f7a7dd.jpg'
        },
        {
          name: 'Single Trust',
          quantity: 1,
          image: 'https://homestagestorage.s3.ap-south-1.amazonaws.com/assets/images/images-1.jpg'
        },
        {
          name: 'Digital Mixer',
          quantity: 1,
          image: 'https://homestagestorage.s3.ap-south-1.amazonaws.com/assets/images/media_1d7ba5618ec377c7a90bab247f5cf79f7bcfd4a60.jpeg'
        },
        {
          name: 'Base',
          quantity: 2,
          image: 'https://homestagestorage.s3.ap-south-1.amazonaws.com/assets/images/EV-EKX-18SP-Professional-18inch-powered-subwoofer.webp'
        },
        {
          name: 'Top',
          quantity: 4,
          image: 'https://homestagestorage.s3.ap-south-1.amazonaws.com/assets/images/jbl-top-speaker-model-stx825.jpg'
        },
        {
          name: 'Sharpy Lights',
          quantity: 4,
          image: 'https://homestagestorage.s3.ap-south-1.amazonaws.com/assets/images/ecf02e08a0ab50c0f29c5eee19c30b8e.jpg'
        },
        {
          name: 'Wireless Mic',
          quantity: 1,
          image: 'https://homestagestorage.s3.ap-south-1.amazonaws.com/assets/images/24df9fcf45f29584385561fe08d29ca8.jpg'
        },
      ],
    },
    {
      name: 'Standard Kit',
      price: 8000,
      image: 'https://homestagestorage.s3.ap-south-1.amazonaws.com/assets/images/bcf9e399b5d59de27775af8e6f6d271f.jpg',
      includedItems: [
        {
          name: 'Operator',
          quantity: 'For entire event',
          image: 'https://homestagestorage.s3.ap-south-1.amazonaws.com/assets/images/dj-guy-with-long-hair-is-listening-his-brand-new-song-stereo-which-he-s-just-recorded-studio_341052-1990.jpg.avif'
        },
        {
          name: 'Base',
          quantity: 2,
          image: 'https://homestagestorage.s3.ap-south-1.amazonaws.com/assets/images/EV-EKX-18SP-Professional-18inch-powered-subwoofer.webp'
        },
        {
          name: 'Top',
          quantity: 4,
          image: 'https://homestagestorage.s3.ap-south-1.amazonaws.com/assets/images/jbl-top-speaker-model-stx825.jpg'
        },
        {
          name: 'Floor',
          quantity: '12x12',
          image: 'https://homestagestorage.s3.ap-south-1.amazonaws.com/assets/images/d13490a6d022a454f90e86d8bd1bf3d5.jpg'
        },
        {
          name: 'LED Lights',
          quantity: 5,
          image: 'https://homestagestorage.s3.ap-south-1.amazonaws.com/assets/images/images.jpeg'
        },
        {
          name: 'Wireless Mic',
          quantity: 1,
          image: 'https://homestagestorage.s3.ap-south-1.amazonaws.com/assets/images/24df9fcf45f29584385561fe08d29ca8.jpg'
        },
      ],
    },
    {
      name: 'Basic Kit',
      price: 6000,
      image: 'https://homestagestorage.s3.ap-south-1.amazonaws.com/assets/images/89bc332145dc8a73562a2a2c0977bd53.jpg',
      includedItems: [
        {
          name: 'Operator',
          quantity: 'For entire event',
          image: 'https://homestagestorage.s3.ap-south-1.amazonaws.com/assets/images/dj-guy-with-long-hair-is-listening-his-brand-new-song-stereo-which-he-s-just-recorded-studio_341052-1990.jpg.avif'
        },
        {
          name: 'Base',
          quantity: 2,
          image: 'https://homestagestorage.s3.ap-south-1.amazonaws.com/assets/images/EV-EKX-18SP-Professional-18inch-powered-subwoofer.webp'
        },
        {
          name: 'Top',
          quantity: 2,
          image: 'https://homestagestorage.s3.ap-south-1.amazonaws.com/assets/images/jbl-top-speaker-model-stx825.jpg'
        },
        {
          name: 'Floor',
          quantity: '12x12',
          image: 'https://homestagestorage.s3.ap-south-1.amazonaws.com/assets/images/d13490a6d022a454f90e86d8bd1bf3d5.jpg'
        },
        {
          name: 'LED Lights',
          quantity: 5,
          image: 'https://homestagestorage.s3.ap-south-1.amazonaws.com/assets/images/images.jpeg'
        },
        {
          name: 'Wireless Mic',
          quantity: 1,
          image: 'https://homestagestorage.s3.ap-south-1.amazonaws.com/assets/images/24df9fcf45f29584385561fe08d29ca8.jpg'
        },
      ],
    },
  ];

  return res.status(200).json({ equipments, kits });
};

module.exports = {
  getEquipmentsAndKits
};