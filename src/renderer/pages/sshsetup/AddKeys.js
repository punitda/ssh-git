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
    <div className="flex flex-col items-center justify-center mx-auto">
      <h2 className="mx-16 mt-8 mb-8 text-xl text-center text-gray-900">
        To start using the ssh key that was generated in last step, you need to
        add it to your account.
      </h2>
      <button className="primary-btn">Add Keys</button>

      <div className="flex flex-row mt-8 w-screen">
        <span className="flex-1 m-auto border-b-2 border-dashed border-gray-500">
          {''}
        </span>
        <span className="flex-none px-2 text-gray-700 text-xl">OR</span>
        <span className="flex-1 m-auto border-b-2 border-dashed border-gray-500">
          {''}
        </span>
      </div>
      <h2 className="mx-16 mt-4 mb-4 text-xl text-center text-gray-900">
        To add keys manually follow below steps
      </h2>
      <div className="flex flex-row m-2 justify-between items-start">
        <div className="flex flex-col w-1/2 ml-4">
          <h3 className="text-base font-semibold mt-2">Follow below steps:</h3>
          <ul className="pr-12 text-left">
            <li>
              1. Copy Public key you seen on your right side to your clipboard.
            </li>
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
              identify the machine in future. <br />
              [E.x: Macbook Pro(Office)].
            </li>
          </ul>
        </div>
        <div className="flex flex-col w-1/2">
          <h3 className="text-base font-semibold">Public Key:</h3>
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
    </div>
  );
}

export default AddKeys;
