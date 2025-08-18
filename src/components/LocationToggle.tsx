
import React from 'react';
import { LocationType } from './MapView';

interface LocationToggleProps {
  locationType: LocationType;
  onLocationTypeChange: (type: LocationType) => void;
}

export const LocationToggle = ({ locationType, onLocationTypeChange }: LocationToggleProps) => {
  return (
    <div className="flex items-center space-x-4 bg-gray-50 p-2 rounded-lg">
      <span className="text-sm font-medium text-gray-700 hidden sm:inline">Show:</span>
      <div className="flex space-x-2">
        <label className="flex items-center cursor-pointer">
          <input
            type="radio"
            name="location-type"
            value="where_live"
            checked={locationType === 'where_live'}
            onChange={() => onLocationTypeChange('where_live')}
            className="mr-2"
          />
          <span className="text-sm">Where They Live</span>
        </label>
        <label className="flex items-center cursor-pointer">
          <input
            type="radio"
            name="location-type"
            value="where_met"
            checked={locationType === 'where_met'}
            onChange={() => onLocationTypeChange('where_met')}
            className="mr-2"
          />
          <span className="text-sm">Where We Met</span>
        </label>
      </div>
    </div>
  );
};
