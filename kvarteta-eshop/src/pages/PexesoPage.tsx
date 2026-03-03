import React from 'react';
import type { CartItem } from '../App';
import HeroSectionPexeso from '../components/HeroSectionPexeso';
import FeaturesSectionPexeso from '../components/FeaturesSectionPexeso';
import ProductShowcasePexeso from '../components/ProductShowcasePexeso';
import PexesoCreator from '../components/PexesoCreator';

interface PexesoPageProps {
    onAddToCart: (product: Omit<CartItem, 'quantity'>) => void;
}

const PexesoPage: React.FC<PexesoPageProps> = ({ onAddToCart }) => {
    return (
        <>
            <HeroSectionPexeso />
            <FeaturesSectionPexeso />
            <ProductShowcasePexeso onAddToCart={onAddToCart} />
            <PexesoCreator onAddToCart={onAddToCart} />
        </>
    );
};

export default PexesoPage;
