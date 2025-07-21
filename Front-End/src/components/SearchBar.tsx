'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, MapPin, Factory, DollarSign, Ruler } from 'lucide-react';

export default function SearchBar() {
  const [searchFilters, setSearchFilters] = useState({
    region: '',
    ville: '',
    typeZone: '',
    budget: '',
    superficie: '',
    typeIndustrie: '',
    etatProjet: ''
  });

  const regions = [
    'Casablanca-Settat',
    'Rabat-Salé-Kénitra',
    'Fès-Meknès',
    'Marrakech-Safi',
    'Tanger-Tétouan-Al Hoceïma',
    'Souss-Massa',
    'Oriental',
    'Darâa-Tafilalet',
    'Beni Mellal-Khénifra',
    'Guelmim-Oued Noun',
    'Laâyoune-Sakia El Hamra',
    'Dakhla-Oued Ed-Dahab'
  ];

  const typesZone = [
    'Zone Industrielle',
    'Parc Logistique',
    'Zone Franche',
    'Technopole',
    'Zone Agroalimentaire',
    'Zone Textile',
    'Zone Automobile',
    'Zone Pharmaceutique'
  ];

  const typesIndustrie = [
    'Automobile',
    'Textile',
    'Agroalimentaire',
    'Pharmaceutique',
    'Électronique',
    'Métallurgie',
    'Chimie',
    'Logistique',
    'Technologies',
    'Énergies Renouvelables'
  ];

  const etatsProjet = [
    'Disponible',
    'En cours de développement',
    'Livraison prochaine',
    'Réservé',
    'Vendu'
  ];

  const budgetRanges = [
    '< 500 000 DH',
    '500 000 - 1 000 000 DH',
    '1 000 000 - 5 000 000 DH',
    '5 000 000 - 10 000 000 DH',
    '> 10 000 000 DH'
  ];

  const superficieRanges = [
    '< 1 000 m²',
    '1 000 - 5 000 m²',
    '5 000 - 10 000 m²',
    '10 000 - 50 000 m²',
    '> 50 000 m²'
  ];

  return (
    <div className="w-full bg-white shadow-lg rounded-lg p-6 mb-8">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Trouvez votre zone industrielle
        </h2>
        <p className="text-gray-600">Recherchez parmi nos zones industrielles disponibles</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* Région */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-red-600" />
            Région
          </label>
          <Select value={searchFilters.region} onValueChange={(value) => setSearchFilters({...searchFilters, region: value})}>
            <SelectTrigger>
              <SelectValue placeholder="Choisissez" />
            </SelectTrigger>
            <SelectContent>
              {regions.map((region) => (
                <SelectItem key={region} value={region}>{region}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Ville */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Ville</label>
          <Input
            placeholder="Choisissez"
            value={searchFilters.ville}
            onChange={(e) => setSearchFilters({...searchFilters, ville: e.target.value})}
          />
        </div>

        {/* Type de Zone */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
            <Factory className="w-4 h-4 text-red-600" />
            Type de Zone
          </label>
          <Select value={searchFilters.typeZone} onValueChange={(value) => setSearchFilters({...searchFilters, typeZone: value})}>
            <SelectTrigger>
              <SelectValue placeholder="Choisissez" />
            </SelectTrigger>
            <SelectContent>
              {typesZone.map((type) => (
                <SelectItem key={type} value={type}>{type}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Budget */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-red-600" />
            Budget
          </label>
          <Select value={searchFilters.budget} onValueChange={(value) => setSearchFilters({...searchFilters, budget: value})}>
            <SelectTrigger>
              <SelectValue placeholder="Choisissez" />
            </SelectTrigger>
            <SelectContent>
              {budgetRanges.map((range) => (
                <SelectItem key={range} value={range}>{range}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Filtres avancés */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {/* Type d'Industrie */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Type d'Industrie</label>
          <Select value={searchFilters.typeIndustrie} onValueChange={(value) => setSearchFilters({...searchFilters, typeIndustrie: value})}>
            <SelectTrigger>
              <SelectValue placeholder="Type d'Industrie" />
            </SelectTrigger>
            <SelectContent>
              {typesIndustrie.map((type) => (
                <SelectItem key={type} value={type}>{type}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Superficie */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
            <Ruler className="w-4 h-4 text-red-600" />
            Superficie
          </label>
          <Select value={searchFilters.superficie} onValueChange={(value) => setSearchFilters({...searchFilters, superficie: value})}>
            <SelectTrigger>
              <SelectValue placeholder="Superficie" />
            </SelectTrigger>
            <SelectContent>
              {superficieRanges.map((range) => (
                <SelectItem key={range} value={range}>{range}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* État du Projet */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">État du Projet</label>
          <Select value={searchFilters.etatProjet} onValueChange={(value) => setSearchFilters({...searchFilters, etatProjet: value})}>
            <SelectTrigger>
              <SelectValue placeholder="État de projet" />
            </SelectTrigger>
            <SelectContent>
              {etatsProjet.map((etat) => (
                <SelectItem key={etat} value={etat}>{etat}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Bouton de recherche */}
      <div className="flex justify-center">
        <Button className="search-blue text-white px-8 py-3 rounded-full hover:opacity-90 transition-opacity">
          <Search className="w-5 h-5 mr-2" />
          Rechercher
        </Button>
      </div>
    </div>
  );
}
