"use client";

import { useState, useEffect, ChangeEvent } from "react";
import { v4 as uuidv4 } from "uuid";
import { menuSidebar } from "@/app/routers/getService";
import { Menu, MenuAccess, Role, SubMenuAccess } from "@/app/model/roleModel";
import { postAddRole } from "@/app/routers/postService";

export default function ManagePermissionPage() {
  const [step, setStep] = useState<number>(1);
  const [role, setRole] = useState<Role>({
    r_cre: true,
    r_upd: true,
    r_del: false,
    r_app: true,
    r_poi_id: uuidv4(),
    r_poi_name: "",
    r_oth_id: [],
    r_oth_name: [],
  });
  const [menuAccess, setMenuAccess] = useState<MenuAccess[]>([]);
  const [subMenuAccess, setSubMenuAccess] = useState<SubMenuAccess[]>([]);
  const [selectedMenus, setSelectedMenus] = useState<string[]>([]);
  const [selectedSubMenus, setSelectedSubMenus] = useState<string[]>([]);
  const [menus, setMenus] = useState<Menu[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [showMenuSelect, setShowMenuSelect] = useState<boolean>(true);
  const [showSubMenuSelect, setShowSubMenuSelect] = useState<boolean>(true);

  // Fetch Menus with SubMenus using Axios
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const menuRes: any = await menuSidebar();
        setMenus(menuRes);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleRoleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, type, checked, value } = e.target;
    setRole((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleOtherPermissions = (
    e: ChangeEvent<HTMLInputElement>,
    index: number,
    field: "r_oth_name"
  ) => {
    const newValues = [...role[field]];
    newValues[index] = e.target.value;
    setRole((prev) => ({ ...prev, [field]: newValues }));
  };

  const addOtherPermission = () => {
    setRole((prev) => ({
      ...prev,
      r_oth_id: [...prev.r_oth_id, uuidv4()],
      r_oth_name: [...prev.r_oth_name, ""],
    }));
  };

  const removeOtherPermission = (index: number) => {
    setRole((prev) => ({
      ...prev,
      r_oth_id: prev.r_oth_id.filter((_, i) => i !== index),
      r_oth_name: prev.r_oth_name.filter((_, i) => i !== index),
    }));
  };

  const saveRole = () => {
    console.log("Role saved:", role);
    setStep(2);
  };

  const handleMenuSelection = (menuId: string) => {
    setSelectedMenus((prev) =>
      prev.includes(menuId)
        ? prev.filter((id) => id !== menuId)
        : [...prev, menuId]
    );
  };

  const handleCheckAllMenus = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedMenus(menus.map((menu) => menu.menuId));
    } else {
      setSelectedMenus([]);
    }
  };

  const addMenuAccess = () => {
    if (selectedMenus.length > 0) {
      const newAccess = selectedMenus.map((menuId) => ({
        menuAccessid: `${menuId}`,
        menuId,
        canAccess: true,
      }));
      setMenuAccess((prev) => [...prev, ...newAccess]);
      setSelectedMenus([]);
      setShowMenuSelect(false);
    } else {
      alert("Please select at least one Menu.");
    }
  };

  const removeMenuAccess = (menuAccessid: string) => {
    setMenuAccess((prev) => {
      const newAccess = prev.filter(
        (access) => access.menuAccessid !== menuAccessid
      );
      if (newAccess.length === 0) {
        setShowMenuSelect(true);
      }
      return newAccess;
    });
  };

  const proceedToSubMenu = () => {
    if (menuAccess.length > 0) {
      setStep(3);
    } else {
      alert("Please add at least one Menu Access before proceeding.");
    }
  };

  const handleSubMenuSelection = (submenuId: string) => {
    setSelectedSubMenus((prev) =>
      prev.includes(submenuId)
        ? prev.filter((id) => id !== submenuId)
        : [...prev, submenuId]
    );
  };

  const handleCheckAllSubMenus = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedSubMenus(
        availableSubMenus.map((submenu) => submenu.submenuid)
      );
    } else {
      setSelectedSubMenus([]);
    }
  };

  const addSubMenuAccess = () => {
    if (selectedSubMenus.length > 0) {
      const newAccess = selectedSubMenus.map((submenuId) => ({
        subMenuAccessId: `${submenuId}`,
        submenuId,
        canAccess: true,
        canCreate: false,
        canUpdate: false,
        canDelete: false,
      }));
      setSubMenuAccess((prev) => [...prev, ...newAccess]);
      setSelectedSubMenus([]);
      setShowSubMenuSelect(false);
    } else {
      alert("Please select at least one SubMenu.");
    }
  };

  const removeSubMenuAccess = (subMenuAccessId: string) => {
    setSubMenuAccess((prev) => {
      const newAccess = prev.filter(
        (access) => access.subMenuAccessId !== subMenuAccessId
      );
      if (newAccess.length === 0) {
        setShowSubMenuSelect(true);
      }
      return newAccess;
    });
  };

  const completeProcess = () => {
    console.log("Final data:", { role, menuAccess, subMenuAccess });
    const payload = { role, menuAccess, subMenuAccess };
    alert("Permission setup completed!");
    const resultRole = postAddRole(payload);
  };

  const cancelSetup = () => {
    setRole({
      r_cre: true,
      r_upd: true,
      r_del: false,
      r_app: true,
      r_poi_id: uuidv4(),
      r_poi_name: "",
      r_oth_id: [],
      r_oth_name: [],
    });
    setMenuAccess([]);
    setSubMenuAccess([]);
    setSelectedMenus([]);
    setSelectedSubMenus([]);
    setStep(1);
    setShowMenuSelect(true);
    setShowSubMenuSelect(true);
  };

  // Get subMenus for selected menus
  const availableSubMenus = menus
    .filter((menu) =>
      menuAccess.some((access) => access.menuId === menu.menuId)
    )
    .flatMap((menu) => menu.subMenus);

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full mx-auto p-6 bg-white rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">
          Manage Permissions
        </h1>

        {/* Timeline */}
        <div className="relative">
          <div className="absolute left-4 top-0 h-full w-1 bg-indigo-200"></div>

          {/* Step 1: Create Role */}
          <div className="mb-8 relative">
            <div className="flex items-center mb-4">
              <div className="w-8 h-8 bg-indigo-600 text-white rounded-full flex items-center justify-center z-10">
                1
              </div>
              <h2 className="ml-4 text-xl font-semibold text-gray-700">
                Create Role
              </h2>
            </div>
            {step === 1 ? (
              <div className="pl-12">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Position ID
                    </label>
                    <div className="mt-1 block w-full p-2 border rounded-md bg-gray-100 text-gray-600 text-sm">
                      {role.r_poi_id}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Position Name
                    </label>
                    <input
                      type="text"
                      name="r_poi_name"
                      value={role.r_poi_name}
                      onChange={handleRoleChange}
                      className="mt-1 block w-full p-2 border rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                    />
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      name="r_cre"
                      checked={role.r_cre}
                      onChange={handleRoleChange}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                    <label className="ml-2 text-sm text-gray-700">
                      Can Create
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      name="r_upd"
                      checked={role.r_upd}
                      onChange={handleRoleChange}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                    <label className="ml-2 text-sm text-gray-700">
                      Can Update
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      name="r_del"
                      checked={role.r_del}
                      onChange={handleRoleChange}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                    <label className="ml-2 text-sm text-gray-700">
                      Can Delete
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      name="r_app"
                      checked={role.r_app}
                      onChange={handleRoleChange}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                    <label className="ml-2 text-sm text-gray-700">
                      Can Approve
                    </label>
                  </div>
                </div>
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700">
                    Other Permissions
                  </label>
                  {role.r_oth_id.map((id, index) => (
                    <div key={id} className="flex items-center space-x-2 mt-2">
                      <div className="block w-1/2 p-2 border rounded-md bg-gray-100 text-gray-600 text-sm">
                        {id}
                      </div>
                      <input
                        type="text"
                        value={role.r_oth_name[index]}
                        onChange={(e) =>
                          handleOtherPermissions(e, index, "r_oth_name")
                        }
                        placeholder="Permission Name"
                        className="block w-1/2 p-2 border rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                      />
                      <button
                        onClick={() => removeOtherPermission(index)}
                        className="px-2 py-1 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm"
                      >
                        Delete
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={addOtherPermission}
                    className="mt-2 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 text-sm"
                  >
                    Add Other Permission
                  </button>
                </div>
                <button
                  onClick={saveRole}
                  className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 text-sm"
                >
                  Save Role and Proceed
                </button>
              </div>
            ) : (
              <div className="pl-12 text-gray-600 text-sm">
                Role created: {role.r_poi_name}
              </div>
            )}
          </div>

          {/* Step 2: Assign Menu Access */}
          <div className="mb-8 relative">
            <div className="flex items-center mb-4">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center z-10 ${
                  step >= 2
                    ? "bg-indigo-600 text-white"
                    : "bg-gray-300 text-gray-600"
                }`}
              >
                2
              </div>
              <h2 className="ml-4 text-xl font-semibold text-gray-700">
                Assign Menu Access
              </h2>
            </div>
            {step === 2 ? (
              <div className="pl-12">
                {isLoading ? (
                  <div className="text-sm text-gray-600">Loading menus...</div>
                ) : (
                  <>
                    {showMenuSelect && (
                      <div className="mb-4 p-4 bg-gray-50 rounded-lg shadow-sm">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Select Menus (Apps)
                        </label>
                        <div className="flex items-center mb-2">
                          <input
                            type="checkbox"
                            checked={
                              selectedMenus.length === menus.length &&
                              menus.length > 0
                            }
                            onChange={handleCheckAllMenus}
                            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                          />
                          <label className="ml-2 text-sm text-gray-700">
                            Check All
                          </label>
                        </div>
                        {menus.map((menu) => (
                          <div
                            key={menu.menuId}
                            className="flex items-center mt-1"
                          >
                            <input
                              type="checkbox"
                              checked={selectedMenus.includes(menu.menuId)}
                              onChange={() => handleMenuSelection(menu.menuId)}
                              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                            />
                            <label className="ml-2 text-sm text-gray-700">
                              {menu.name}
                            </label>
                          </div>
                        ))}
                        <button
                          onClick={addMenuAccess}
                          className="mt-3 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 text-sm"
                        >
                          Add Selected Menus
                        </button>
                      </div>
                    )}
                    {menuAccess.length > 0 && (
                      <div className="mt-4">
                        <table className="w-full border-collapse bg-white rounded-lg shadow-sm">
                          <thead>
                            <tr className="bg-indigo-100">
                              <th className="p-2 text-left text-xs font-medium text-gray-700">
                                Menu Name
                              </th>
                              <th className="p-2 text-left text-xs font-medium text-gray-700">
                                Can Access
                              </th>
                              <th className="p-2 text-left text-xs font-medium text-gray-700">
                                Action
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {menuAccess.map((access) => (
                              <tr
                                key={access.menuAccessid}
                                className="border-b hover:bg-gray-50"
                              >
                                <td className="p-2 text-xs text-gray-600">
                                  {menus.find((m) => m.menuId === access.menuId)
                                    ?.name || access.menuId}
                                </td>
                                <td className="p-2 text-xs text-gray-600">
                                  {access.canAccess ? "Yes" : "No"}
                                </td>
                                <td className="p-2">
                                  <button
                                    onClick={() =>
                                      removeMenuAccess(access.menuAccessid)
                                    }
                                    className="px-2 py-1 bg-red-600 text-white rounded-md hover:bg-red-700 text-xs"
                                  >
                                    Remove
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                    <button
                      onClick={proceedToSubMenu}
                      className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 text-sm"
                    >
                      Proceed to SubMenu Access
                    </button>
                  </>
                )}
              </div>
            ) : step > 2 ? (
              <div className="pl-12 text-gray-600 text-sm">
                Menu Access assigned: {menuAccess.length} menu(s)
              </div>
            ) : (
              <div className="pl-12 text-gray-400 text-sm">
                Waiting for Role creation...
              </div>
            )}
          </div>

          {/* Step 3: Assign SubMenu Access */}
          <div className="relative">
            <div className="flex items-center mb-4">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center z-10 ${
                  step >= 3
                    ? "bg-indigo-600 text-white"
                    : "bg-gray-300 text-gray-600"
                }`}
              >
                3
              </div>
              <h2 className="ml-4 text-xl font-semibold text-gray-700">
                Assign SubMenu Access
              </h2>
            </div>
            {step === 3 ? (
              <div className="pl-12">
                {isLoading ? (
                  <div className="text-sm text-gray-600">
                    Loading submenus...
                  </div>
                ) : (
                  <>
                    {showSubMenuSelect && availableSubMenus.length > 0 && (
                      <div className="mb-4 p-4 bg-gray-50 rounded-lg shadow-sm">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Select SubMenus (Modules)
                        </label>
                        <div className="flex items-center mb-2">
                          <input
                            type="checkbox"
                            checked={
                              selectedSubMenus.length ===
                                availableSubMenus.length &&
                              availableSubMenus.length > 0
                            }
                            onChange={handleCheckAllSubMenus}
                            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                          />
                          <label className="ml-2 text-sm text-gray-700">
                            Check All
                          </label>
                        </div>
                        {availableSubMenus.map((submenu) => (
                          <div
                            key={submenu.submenuid}
                            className="flex items-center mt-1"
                          >
                            <input
                              type="checkbox"
                              checked={selectedSubMenus.includes(
                                submenu.submenuid
                              )}
                              onChange={() =>
                                handleSubMenuSelection(submenu.submenuid)
                              }
                              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                            />
                            <label className="ml-2 text-sm text-gray-700">
                              {submenu.name} (Menu:{" "}
                              {
                                menus.find((m) => m.menuId === submenu.menuId)
                                  ?.name
                              }
                              )
                            </label>
                          </div>
                        ))}
                        <button
                          onClick={addSubMenuAccess}
                          className="mt-3 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 text-sm"
                        >
                          Add Selected SubMenus
                        </button>
                      </div>
                    )}
                    {availableSubMenus.length === 0 && showSubMenuSelect && (
                      <div className="text-gray-600 text-sm">
                        No submenus available for selected menus.
                      </div>
                    )}
                    {subMenuAccess.length > 0 && (
                      <div className="mt-4">
                        <table className="w-full border-collapse bg-white rounded-lg shadow-sm">
                          <thead>
                            <tr className="bg-indigo-100">
                              <th className="p-2 text-left text-xs font-medium text-gray-700">
                                SubMenu Name
                              </th>
                              <th className="p-2 text-left text-xs font-medium text-gray-700">
                                Menu
                              </th>
                              <th className="p-2 text-left text-xs font-medium text-gray-700">
                                Can Access
                              </th>
                              <th className="p-2 text-left text-xs font-medium text-gray-700">
                                Can Create
                              </th>
                              <th className="p-2 text-left text-xs font-medium text-gray-700">
                                Can Update
                              </th>
                              <th className="p-2 text-left text-xs font-medium text-gray-700">
                                Can Delete
                              </th>
                              <th className="p-2 text-left text-xs font-medium text-gray-700">
                                Action
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {subMenuAccess.map((access) => (
                              <tr
                                key={access.subMenuAccessId}
                                className="border-b hover:bg-gray-50"
                              >
                                <td className="p-2 text-xs text-gray-600">
                                  <td className="p-2 text-xs text-gray-600">
                                    {menus.find((m) =>
                                      m.subMenus.some(
                                        (s) => s.submenuid === access.submenuId
                                      )
                                    )?.name || "Unknown"}
                                  </td>
                                </td>
                                <td className="p-2 text-xs text-gray-600">
                                  {menus.find((m) =>
                                    m.subMenus.some(
                                      (s) => s.submenuid === access.submenuId
                                    )
                                  )?.name || "Unknown"}
                                </td>
                                <td className="p-2 text-xs text-gray-600">
                                  {role.r_app ? "Yes" : "No"}
                                </td>
                                <td className="p-2 text-xs text-gray-600">
                                  {role.r_cre ? "Yes" : "No"}
                                </td>
                                <td className="p-2 text-xs text-gray-600">
                                  {role.r_upd ? "Yes" : "No"}
                                </td>
                                <td className="p-2 text-xs text-gray-600">
                                  {role.r_del ? "Yes" : "No"}
                                </td>
                                <td className="p-2">
                                  <button
                                    onClick={() =>
                                      removeSubMenuAccess(
                                        access.subMenuAccessId
                                      )
                                    }
                                    className="px-2 py-1 bg-red-600 text-white rounded-md hover:bg-red-700 text-xs"
                                  >
                                    Remove
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                    <div className="mt-4 flex space-x-2">
                      <button
                        onClick={cancelSetup}
                        className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={completeProcess}
                        className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm"
                      >
                        Complete Setup
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="pl-12 text-gray-400 text-sm">
                Waiting for Menu Access assignment...
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
