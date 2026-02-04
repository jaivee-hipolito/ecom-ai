declare namespace google {
  namespace maps {
    namespace places {
      interface PlaceResult {
        address_components?: AddressComponent[];
        formatted_address?: string;
        geometry?: {
          location?: {
            lat: () => number;
            lng: () => number;
          };
        };
        name?: string;
        place_id?: string;
      }

      interface AddressComponent {
        long_name: string;
        short_name: string;
        types: string[];
      }

      class Autocomplete {
        constructor(input: HTMLInputElement | null, options?: AutocompleteOptions);
        addListener(event: string, callback: () => void): void;
        getPlace(): PlaceResult;
      }

      interface AutocompleteOptions {
        types?: string[];
        componentRestrictions?: {
          country?: string | string[];
        };
        fields?: string[];
      }
    }

    namespace event {
      function addListener(instance: any, eventName: string, handler: () => void): void;
      function clearInstanceListeners(instance: any): void;
    }
  }
}
