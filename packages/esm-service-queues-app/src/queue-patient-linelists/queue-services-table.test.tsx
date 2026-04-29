import React from 'react';
import { render } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { useServiceQueueEntries } from '../service-queues.resource';
import ServicesTable from './queue-services-table.component';

jest.mock('../service-queues.resource', () => ({
  useServiceQueueEntries: jest.fn().mockReturnValue({ serviceQueueEntries: [], isLoading: false }),
}));

jest.mock('./queue-linelist-base-table.component', () => ({
  __esModule: true,
  default: jest.fn(() => <div data-testid="base-table" />),
}));

const mockUseServiceQueueEntries = jest.mocked(useServiceQueueEntries);

function renderAtPath(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/queue-list/:service/:serviceUuid/:locationUuid" element={<ServicesTable />} />
      </Routes>
    </MemoryRouter>,
  );
}

describe('ServicesTable route params', () => {
  it('decodes a multi-word service name and forwards locationUuid unchanged', () => {
    renderAtPath('/queue-list/Primary%20Health%20Care/service-123/location-456');

    expect(mockUseServiceQueueEntries).toHaveBeenCalledWith('Primary Health Care', 'location-456');
  });

  it('handles non-space encoded characters in the service name', () => {
    renderAtPath('/queue-list/Triage%20%26%20Intake/service-123/location-456');

    expect(mockUseServiceQueueEntries).toHaveBeenCalledWith('Triage & Intake', 'location-456');
  });

  it('passes through a single-word service name as-is', () => {
    renderAtPath('/queue-list/Triage/service-123/location-456');

    expect(mockUseServiceQueueEntries).toHaveBeenCalledWith('Triage', 'location-456');
  });
});
