import React, { useContext } from 'react';

import { ClientStateContext } from '../../Context';
import { openExternal } from '../../../lib/app-shell';

const publicKeyContent =
  'ssh-rsa sdksdlksldkeorkoekrokoreoreor,eroerer== punitdama@gmail.com';

function AddKeys({ onNext }) {
  const clientStateContext = useContext(ClientStateContext);

  function openSettingsPage() {
    openExternal('https://github.com/settings/keys');
  }

  return (
    <div>
      <h2 className="mx-16 mt-8 text-2xl text-center text-gray-900">
        To start using the generated ssh key, you need to add it to your
        account.
      </h2>
      <p className="text-gray-600 text-sm text-center mx-8">
        [Note : You can add keys either automatically(requires permissions){' '}
        <span className="underline italic text-gray-700">OR</span> manually by
        following the steps listed on right side]
      </p>
      <div className="flex flex-row mt-8 items-center justify-around ">
        <h2 className="underline italic text-xl text-gray-700">
          Automatic Process
        </h2>
        <h2 className="underline italic text-xl text-gray-700">
          Manual Process
        </h2>
      </div>
      <div className="flex flex-row mt-4 items-center justify-center">
        <div className="flex flex-col flex-1">
          <button className="primary-btn mx-auto">Add Keys</button>
        </div>
        <div className="flex flex-col flex-none h-56">
          <span className="h-24 border-r-2 border-dashed border-gray-500 w-1"></span>
          <span className="text-gray-700 py-2 -mx-3 text-xl">OR</span>
          <span className="h-24 border-r-2 border-dashed border-gray-500 w-1"></span>
        </div>
        <div className="flex flex-col flex-1">
          <h3 className="text-lg mt-2 ml-32">Steps:</h3>
          <ul className="text-gray-700 pr-12 text-left ml-32 mt-2">
            <li>1. Copy Public key you see below to your clipboard.</li>
            <li>2. Login into your Github account</li>
            <li>
              3. Go to this{' '}
              <button
                className="underline hover:text-blue-500"
                onClick={openSettingsPage}>
                Link
              </button>
            </li>
            <li>
              4. Click "New SSH key" button and paste the content copied on your
              clipboard under "key" input and for "title" input give any name to
              identify the machine in future. [E.x: Macbook Pro(Office)].
            </li>
          </ul>
        </div>
      </div>
      <div className="mx-auto my-4 w-1/2">
        <h3 className="text-xl">Public Key</h3>
        <div className="relative">
          <button className="absolute mt-2 py-2 px-4 font-semibold right-0 top-0 bg-green-500 text-white rounded">
            Copy
          </button>
          <textarea
            rows="8"
            cols="5"
            value={publicKeyContent}
            className="text-gray-600 text-base bg-gray-200 px-4 rounded border-2 mt-2 w-full resize-none"
          />
        </div>
      </div>
    </div>
  );
}

export default AddKeys;
