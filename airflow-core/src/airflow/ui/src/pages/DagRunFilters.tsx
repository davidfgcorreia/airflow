// src/pages/RunIdFilter.tsx or src/components/RunIdFilter.tsx
import { HStack, createListCollection } from "@chakra-ui/react";
import { useSearchParams } from "react-router-dom";
import { Select } from "src/components/ui";
import { SearchBar } from "src/components/SearchBar";
import { SearchParamsKeys, type SearchParamsKeysType } from "src/constants/searchParams";

const { RUN_ID_PATTERN: RUN_ID_PATTERN_PARAM, DAG_RUN_TAG: DAG_RUN_TAG_PARAM }: SearchParamsKeysType = {
  ...SearchParamsKeys,
  DAG_RUN_TAG: "dag_run_tag",
};

export const DagRunFilter = ({
  runIds,
  selectedRunId,
  setSelectedRunId,
  dagRunTag,
  setDagRunTag,
}: {
  readonly runIds: string[];
  readonly selectedRunId: string | undefined;
  readonly setSelectedRunId: (value: string | undefined) => void;
  readonly dagRunTag: string | undefined;
  readonly setDagRunTag: (value: string | undefined) => void;
}) => {
  const [searchParams, setSearchParams] = useSearchParams();

  return (
    <HStack gap={2}>
      <Select.Root
        collection={createListCollection({
          items: [
            { label: "All Run IDs", value: "all" },
            ...runIds.map((id) => ({ label: id, value: id })),
          ],
        })}
        maxW="300px"
        onValueChange={({ value }) => {
          const runId = value[0];
          if (runId && runId !== "all") {
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
        <Select.Trigger colorPalette="blue" isActive={!!selectedRunId} minW="max-content">
          <Select.ValueText width="auto">
            {() => selectedRunId ?? "All Run IDs"}
          </Select.ValueText>
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
        placeHolder="Filter by Tag"
        defaultValue={dagRunTag ?? ""}
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
        hideAdvanced
        hotkeyDisabled
        buttonProps={{ disabled: true }}
      />
    </HStack>
  );
};

export default DagRunFilter;
