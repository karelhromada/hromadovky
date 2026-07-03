import React from 'react';
import type { CartItem } from '../App';
import { PageHead } from '../components/seo/PageHead';
import { SEO } from '../data/seo';
import HeroSectionPexeso from '../components/HeroSectionPexeso';
import FeaturesSectionPexeso from '../components/FeaturesSectionPexeso';
import ProductShowcasePexeso from '../components/ProductShowcasePexeso';
import PexesoCreator from '../components/PexesoCreator';

import { useLocation } from 'react-router-dom';

interface PexesoPageProps {
    onAddToCart: (product: Omit<CartItem, 'quantity'>) => void;
}

const PexesoPage: React.FC<PexesoPageProps> = ({ onAddToCart }) => {
    const { hash } = useLocation();

    React.useEffect(() => {
        if (hash) {
            const element = document.getElementById(hash.replace('#', ''));
            if (element) {
                setTimeout(() => {
                    element.scrollIntoView({ behavior: 'smooth' });
                }, 100);
            }
        }
    }, [hash]);

    return (
        <>
            <PageHead {...SEO.pexeso} />
            <HeroSectionPexeso />
            <ProductShowcasePexeso onAddToCart={onAddToCart} />
            <FeaturesSectionPexeso />
            <PexesoCreator onAddToCart={onAddToCart} />
        </>
    );
};

export default PexesoPage;
