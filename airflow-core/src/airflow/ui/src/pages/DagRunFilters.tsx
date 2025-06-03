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
// src/pages/RunIdFilter.tsx or src/components/RunIdFilter.tsx
import { HStack, createListCollection } from "@chakra-ui/react";
import { useSearchParams } from "react-router-dom";

import { SearchBar } from "src/components/SearchBar";
import { Select } from "src/components/ui";
import { SearchParamsKeys, type SearchParamsKeysType } from "src/constants/searchParams";

const { DAG_RUN_TAG: DAG_RUN_TAG_PARAM, RUN_ID_PATTERN: RUN_ID_PATTERN_PARAM }: SearchParamsKeysType = {
  ...SearchParamsKeys,
  DAG_RUN_TAG: "dag_run_tag",
};

export const DagRunFilter = ({
  dagRunTag,
  runIds,
  selectedRunId,
  setDagRunTag,
  setSelectedRunId,
}: {
  readonly dagRunTag: string | undefined;
  readonly runIds: Array<string>;
  readonly selectedRunId: string | undefined;
  readonly setDagRunTag: (value: string | undefined) => void;
  readonly setSelectedRunId: (value: string | undefined) => void;
}) => {
  const [searchParams, setSearchParams] = useSearchParams();

  return (
    <HStack gap={2}>
      <Select.Root
        collection={createListCollection({
          items: [{ label: "All Run IDs", value: "all" }, ...runIds.map((id) => ({ label: id, value: id }))],
        })}
        maxW="300px"
        onValueChange={({ value }) => {
          const [runId] = value;

          if (runId !== undefined && runId !== "all") {
            searchParams.set(RUN_ID_PATTERN_PARAM, runId);
            setSelectedRunId(runId);
          } else {
            searchParams.delete(RUN_ID_PATTERN_PARAM);
            setSelectedRunId(undefined);
          }
          setSearchParams(searchParams);
        }}
        value={[selectedRunId ?? "all"]}
      >
        <Select.Trigger colorPalette="blue" isActive={Boolean(selectedRunId)} minW="max-content">
          <Select.ValueText width="auto">{() => selectedRunId ?? "All Run IDs"}</Select.ValueText>
        </Select.Trigger>
        <Select.Content>
          <Select.Item item={{ label: "All Run IDs", value: "all" }} key="all">
            All Run IDs
          </Select.Item>
          {runIds.map((id) => (
            <Select.Item item={{ label: id, value: id }} key={id}>
              {id}
            </Select.Item>
          ))}
        </Select.Content>
      </Select.Root>
      <SearchBar
        buttonProps={{ disabled: true }}
        defaultValue={dagRunTag ?? ""}
        hideAdvanced
        hotkeyDisabled
        onChange={(value: string) => {
          if (value) {
            searchParams.set(DAG_RUN_TAG_PARAM, value);
            setDagRunTag(value);
          } else {
            searchParams.delete(DAG_RUN_TAG_PARAM);
            setDagRunTag(undefined);
          }
          setSearchParams(searchParams);
        }}
        placeHolder="Filter by Tag"
      />
    </HStack>
  );
};

export default DagRunFilter;
