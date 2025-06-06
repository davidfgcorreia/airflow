/*!
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
import { Box, Heading, Link, VStack } from "@chakra-ui/react";
import type { ColumnDef } from "@tanstack/react-table";
import { useState } from "react";
import { useSearchParams, Link as RouterLink } from "react-router-dom";

import { useAssetServiceGetAssets } from "openapi/queries";
import type { AssetResponse } from "openapi/requests/types.gen";
import { DataTable } from "src/components/DataTable";
import { useTableURLState } from "src/components/DataTable/useTableUrlState";
import { ErrorAlert } from "src/components/ErrorAlert";
import { SearchBar } from "src/components/SearchBar";
import Time from "src/components/Time";
import { SearchParamsKeys } from "src/constants/searchParams";
import { CreateAssetEvent } from "src/pages/Asset/CreateAssetEvent";
import { pluralize } from "src/utils";

import { DependencyPopover } from "./DependencyPopover";

type AssetRow = { row: { original: AssetResponse } };

const columns: Array<ColumnDef<AssetResponse>> = [
  {
    accessorKey: "name",
    cell: ({ row: { original } }: AssetRow) => (
      <Link asChild color="fg.info" fontWeight="bold">
        <RouterLink to={`/assets/${original.id}`}>{original.name}</RouterLink>
      </Link>
    ),
    header: () => "Name",
  },
  {
    accessorKey: "last_asset_event",
    cell: ({ row: { original } }: AssetRow) => {
      const assetEvent = original.last_asset_event;
      const timestamp = assetEvent?.timestamp;

      if (timestamp === null || timestamp === undefined) {
        return undefined;
      }

      return <Time datetime={timestamp} />;
    },
    enableSorting: false,
    header: () => "Last Asset Event",
  },
  {
    accessorKey: "group",
    cell: ({ row: { original } }: AssetRow) => {
      const { group } = original;

      if (!group) {
        return undefined;
      }

      return (
        <Link asChild color="fg.info" fontWeight="bold">
          <RouterLink to={`/assets/group/${group}`}>{group}</RouterLink>
        </Link>
      );
    },
    enableSorting: false,
    header: () => "Group",
  },
  {
    accessorKey: "consuming_dags",
    cell: ({ row: { original } }: AssetRow) =>
      original.consuming_dags.length ? (
        <DependencyPopover dependencies={original.consuming_dags} type="Dag" />
      ) : undefined,
    enableSorting: false,
    header: () => "Consuming Dags",
  },
  {
    accessorKey: "producing_tasks",
    cell: ({ row: { original } }: AssetRow) =>
      original.producing_tasks.length ? (
        <DependencyPopover dependencies={original.producing_tasks} type="Task" />
      ) : undefined,
    enableSorting: false,
    header: () => "Producing Tasks",
  },
  {
    accessorKey: "trigger",
    cell: ({ row }) => <CreateAssetEvent asset={row.original} withText={false} />,
    enableSorting: false,
    header: "",
  },
];

export const AssetsList = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [searchValue, setSearchValue] = useState(
    searchParams.get(SearchParamsKeys.NAME_PATTERN) ??
      searchParams.get(SearchParamsKeys.GROUP_PATTERN) ??
      undefined,
  );

  const { setTableURLState, tableURLState } = useTableURLState();
  const { pagination, sorting } = tableURLState;
  const [sort] = sorting;
  const orderBy = sort ? `${sort.desc ? "-" : ""}${sort.id}` : undefined;

  const {
    data: dataByName,
    error: errorByName,
    isLoading: isLoadingByName,
  } = useAssetServiceGetAssets({
    limit: pagination.pageSize,
    namePattern: searchValue ?? undefined,
    offset: pagination.pageIndex * pagination.pageSize,
    orderBy,
  });

  const {
    data: dataByGroup,
    error: errorByGroup,
    isLoading: isLoadingByGroup,
  } = useAssetServiceGetAssets({
    groupPattern: searchValue ?? undefined,
    limit: pagination.pageSize,
    offset: pagination.pageIndex * pagination.pageSize,
    orderBy,
  });

  // Merge results, removing duplicates
  const assetsByName = dataByName?.assets ?? [];
  const assetsByGroup = dataByGroup?.assets ?? [];
  const assetsMap = new Map<number, AssetResponse>();

  assetsByName.forEach((asset) => assetsMap.set(asset.id, asset));
  assetsByGroup.forEach((asset) => assetsMap.set(asset.id, asset));
  const assets = [...assetsMap.values()];
  const totalEntries = assets.length;

  // Merge loading
  const isLoading = Boolean(isLoadingByName) || Boolean(isLoadingByGroup);

  // Merge errors
  let mergedError: React.ReactNode = undefined;

  if (errorByName !== undefined && errorByGroup !== undefined) {
    mergedError = (
      <>
        <ErrorAlert error={errorByName} />
        <ErrorAlert error={errorByGroup} />
      </>
    );
  } else if (errorByName !== undefined) {
    mergedError = <ErrorAlert error={errorByName} />;
  } else if (errorByGroup !== undefined) {
    mergedError = <ErrorAlert error={errorByGroup} />;
  }

  const handleSearchChange = (value: string) => {
    setSearchValue(value);
    if (value) {
      searchParams.set(SearchParamsKeys.NAME_PATTERN, value);
      searchParams.set(SearchParamsKeys.GROUP_PATTERN, value);
    } else {
      searchParams.delete(SearchParamsKeys.NAME_PATTERN);
      searchParams.delete(SearchParamsKeys.GROUP_PATTERN);
    }
    setSearchParams(searchParams);
    setTableURLState({
      pagination: { ...pagination, pageIndex: 0 },
      sorting,
    });
  };

  return (
    <>
      <VStack alignItems="none">
        <SearchBar
          buttonProps={{ disabled: true }}
          defaultValue={searchValue ?? ""}
          onChange={handleSearchChange}
          placeHolder="Search by name or group"
        />
        <Heading py={3} size="md">
          {pluralize("Asset", totalEntries)}
        </Heading>
      </VStack>
      <Box overflow="auto">
        <DataTable
          columns={columns}
          data={assets}
          errorMessage={mergedError}
          initialState={tableURLState}
          isLoading={isLoading}
          modelName="Asset"
          onStateChange={setTableURLState}
          total={totalEntries}
        />
      </Box>
    </>
  );
};
