import Layout from '@/app/layout';

import { ThemeProvider } from '@/components/theme-provider';
import '@/styles/global.css';
import EditableTable from './app/editable';
import useShowType from './store/show-type';
import usePage from './store/collect-list';
import { useEffect } from 'react';
import { DataCard } from './app/data-card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Filter } from './app/filter';
import useDataset from './store/dataset';
import { Pagination } from './components/ui/pagination';
import { SyncToggle } from './components/sync-toggle';

const App = () => {
  const { showType, setShowType } = useShowType();
  const { initPage, setPage, getTotal, getPageSize } = usePage();
  const { dataset } = useDataset();

  useEffect(() => {
    initPage(dataset.filterText);
  }, []);

  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <SyncToggle/>
      <div className='px-4'>
        <Layout>
          <Tabs defaultValue={showType} className="inline" onValueChange={(value) => { setShowType(value) }}>
            <TabsList className='p-1' style={{ transform: 'translateY(-2px)' }}>
              <TabsTrigger value="card">卡片</TabsTrigger>
              <TabsTrigger value="table">列表</TabsTrigger>
            </TabsList>

            <Filter className='mt-2' />
            <TabsContent value="card"><DataCard /></TabsContent>
            <TabsContent value="table"><EditableTable /></TabsContent>
            <Pagination className='my-4' showTotal total={getTotal()} limit={getPageSize()} onPageChange={(page) => setPage(page)} />
          </Tabs>
        </Layout>
      </div>

    </ThemeProvider>
  );
};

export default App;
